"""
Offline Meter Plan DOCX Exporter

This module provides functionality to export offline meter plan data to DOCX format.
It generates comprehensive reports showing energy plan analysis for offline meters
with detailed breakdown and time-series data.

Key Features:
- Offline meter energy plan analysis (plan - actual)
- Base period vs reporting period comparison
- Detailed data with line charts
- Multi-language support
- Base64 encoding for file transmission

The exported DOCX file includes:
- Cover page with logo and report metadata (Meter Data - Offline Meter Plan)
- Reporting period plan summary table (Plan / Increment Rate)
- Detailed time-series paginated tables + per-page trend line charts
- Parameter data tables + line charts with filled area
"""

import base64
import os
import time
import uuid
import io

from decimal import Decimal
from typing import Optional, Dict, List, Any, BinaryIO
import logging

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

from core.utilities import get_translation, round2

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

_font_setup_done = False


def setup_chinese_fonts():
    global _font_setup_done
    if _font_setup_done:
        return True

    font_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             '..', 'pdfexporters', 'fonts', 'NotoSansCJK-Regular.ttc')
    try:
        import matplotlib.font_manager as fm
        fm.fontManager.addfont(font_path)
        prop = fm.FontProperties(fname=font_path)
        font_name = prop.get_name()
        plt.rcParams['font.sans-serif'] = [font_name]
        plt.rcParams['axes.unicode_minus'] = False
        logger.info(f"Successfully loaded bundled font: {font_name} from {font_path}")
        _font_setup_done = True
        return True
    except Exception as e:
        logger.warning(f"Failed to load bundled font from {font_path}: {e}")

    plt.rcParams['font.sans-serif'] = ['DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False
    logger.warning("Failed to load bundled NotoSansCJK font, using DejaVu Sans")
    return False


def _convert_decimals(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: _convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_convert_decimals(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(_convert_decimals(item) for item in obj)
    return obj


def _set_min_row_height(cell, height_twips=150, exact=False):
    tr = cell._tc.getparent()
    trPr = tr.get_or_add_trPr()
    trHeight = OxmlElement('w:trHeight')
    trHeight.set(qn('w:val'), str(height_twips))
    trHeight.set(qn('w:hRule'), 'exact' if exact else 'atLeast')
    existing = trPr.find(qn('w:trHeight'))
    if existing is not None:
        trPr.remove(existing)
    trPr.append(trHeight)


def _reset_cell_paragraph_spacing(cell, font_size=9):
    line_twips = max(int(font_size * 20 * 1.15), 120)
    for p in cell.paragraphs:
        pf = p.paragraph_format
        pf.space_before = Pt(0)
        pf.space_after = Pt(0)
        pf.line_spacing_rule = WD_LINE_SPACING.SINGLE
        pPr = p._p.get_or_add_pPr()
        spacing = OxmlElement('w:spacing')
        spacing.set(qn('w:before'), '0')
        spacing.set(qn('w:after'), '0')
        spacing.set(qn('w:line'), str(line_twips))
        spacing.set(qn('w:lineRule'), 'exact')
        existing = pPr.find(qn('w:spacing'))
        if existing is not None:
            pPr.remove(existing)
        pPr.append(spacing)
        ind = pPr.find(qn('w:ind'))
        if ind is not None:
            pPr.remove(ind)


def _set_cell_margins_zero(cell):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for side in ['top', 'start', 'bottom', 'end']:
        m = OxmlElement(f'w:{side}')
        m.set(qn('w:w'), '0')
        m.set(qn('w:type'), 'dxa')
        tcMar.append(m)
    existing = tcPr.find(qn('w:tcMar'))
    if existing is not None:
        tcPr.remove(existing)
    tcPr.append(tcMar)


def _remove_table_borders(table):
    tbl = table._tbl
    tblPr = tbl.tblPr if tbl.tblPr is not None else OxmlElement('w:tblPr')
    tblBorders = OxmlElement('w:tblBorders')
    for border_name in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'none')
        border.set(qn('w:sz'), '0')
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), 'auto')
        tblBorders.append(border)
    existing = tblPr.find(qn('w:tblBorders'))
    if existing is not None:
        tblPr.remove(existing)
    tblPr.append(tblBorders)
    if tbl.tblPr is None:
        tbl.insert(0, tblPr)


def _style_table_cell(cell, is_header=False, is_green=False, bold=False, font_size=9):
    cell.paragraphs[0].runs[0].font.bold = bold
    cell.paragraphs[0].runs[0].font.size = Pt(font_size)
    for p in cell.paragraphs:
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    _reset_cell_paragraph_spacing(cell, font_size=font_size)
    _set_cell_margins_zero(cell)
    row_h = max(int(font_size * 20 * 1.3), 160)
    _set_min_row_height(cell, height_twips=row_h, exact=False)
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcBorders = OxmlElement('w:tcBorders')
    for border_name in ['top', 'left', 'bottom', 'right']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'single')
        border.set(qn('w:sz'), '4')
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), '666666')
        tcBorders.append(border)
    tcPr.append(tcBorders)
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    if is_header:
        shd.set(qn('w:fill'), 'D9E2F3')
    elif is_green:
        shd.set(qn('w:fill'), '90EE90')
    else:
        return
    tcPr.append(shd)


class OfflineMeterPlanDOCXExporter:
    """
    Export offline meter plan data to DOCX format.
    Generates comprehensive reports with charts and tables matching Excel layout.
    """

    def __init__(self, language: str = 'zh_CN'):
        font_setup_success = setup_chinese_fonts()
        if not font_setup_success:
            logger.warning("Chinese font setup failed, some text may not display correctly")

        self.language = language
        self.trans = get_translation(language)
        self._ = self.trans.gettext

        self.dpi = 120

        self.chart_colors = ['#4472C4', '#ED7D31', '#70AD47', '#FFC000', '#5B9BD5',
                             '#FF6B6B', '#9B59B6', '#1ABC9C', '#E67E22', '#2ECC71',
                             '#3498DB', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6']

    def export(self,
               report: Dict[str, Any],
               name: str,
               base_period_start_datetime_local: str,
               base_period_end_datetime_local: str,
               reporting_start_datetime_local: str,
               reporting_end_datetime_local: str,
               period_type: str,
               language: str) -> Optional[str]:
        if report is None:
            return None
        start_time = time.time()
        logger.info(f"Starting DOCX generation for {name}")

        docx_filename = self.generate_docx(
            report, name,
            base_period_start_datetime_local,
            base_period_end_datetime_local,
            reporting_start_datetime_local,
            reporting_end_datetime_local,
            period_type,
            language
        )

        result = ''
        if docx_filename and os.path.exists(docx_filename):
            try:
                with open(docx_filename, 'rb') as binary_file:
                    binary_data = binary_file.read()
                result = base64.b64encode(binary_data).decode('utf-8')
            except Exception as e:
                logger.error(f"Failed to encode DOCX: {str(e)}")
            finally:
                try:
                    os.remove(docx_filename)
                except Exception:
                    pass
        elapsed = time.time() - start_time
        logger.info(f"DOCX generation completed in {elapsed:.2f}s for {name}")
        return result

    @staticmethod
    def _fig_to_bytesio(fig, dpi: int) -> BinaryIO:
        buf = io.BytesIO()
        fig.tight_layout()
        fig.savefig(buf, format='png', dpi=dpi, bbox_inches='tight')
        plt.close(fig)
        buf.seek(0)
        return buf

    def generate_docx(self,
                      report: Dict[str, Any],
                      name: str,
                      base_period_start_datetime_local: str,
                      base_period_end_datetime_local: str,
                      reporting_start_datetime_local: str,
                      reporting_end_datetime_local: str,
                      period_type: str,
                      language: str) -> Optional[str]:
        _ = self._

        has_plan_data = \
            "reporting_period" in report.keys() and \
            "values_saving" in report['reporting_period'].keys() and \
            len(report['reporting_period']['values_saving']) > 0

        if not has_plan_data:
            doc = Document()
            section = doc.sections[0]
            section.orientation = 1
            section.page_width = Inches(11.69)
            section.page_height = Inches(8.27)
            is_base = self._is_base_period_timestamp_exists(report.get('base_period', {}))
            self._add_cover_page(doc, name, period_type,
                                 reporting_start_datetime_local,
                                 reporting_end_datetime_local,
                                 base_period_start_datetime_local,
                                 base_period_end_datetime_local,
                                 is_base,
                                 has_next=False)
            filename = str(uuid.uuid4()) + '.docx'
            doc.save(filename)
            return filename

        filename = str(uuid.uuid4()) + '.docx'

        self.report = _convert_decimals(report)
        self.name = name
        self.base_period_start = base_period_start_datetime_local
        self.base_period_end = base_period_end_datetime_local
        self.reporting_start = reporting_start_datetime_local
        self.reporting_end = reporting_end_datetime_local
        self.period_type = period_type

        self.energy_category_name = self.report['offline_meter']['energy_category_name']
        self.unit_of_measure = self.report['offline_meter']['unit_of_measure']

        has_params = self._has_valid_parameters(self.report.get('parameters', {}))
        self.is_base_period_exists = self._is_base_period_timestamp_exists(report['base_period'])

        doc = Document()
        section = doc.sections[0]
        section.orientation = 1
        section.page_width = Inches(11.69)
        section.page_height = Inches(8.27)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)

        reporting_data = self.report['reporting_period']
        reporting_times = reporting_data.get('timestamps', [])
        has_detailed = len(reporting_times) > 0 or self.is_base_period_exists
        has_consumption = True

        self._add_cover_page(doc, name, period_type,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           self.is_base_period_exists,
                           has_next=(has_consumption or has_detailed or has_params))

        self._add_plan_summary(doc, has_next=(has_detailed or has_params))
        self._add_detailed_data_pages(doc, has_next=has_params)
        self._add_parameters_section(doc)

        doc.save(filename)
        logger.info(f"DOCX generated: {filename}")
        return filename

    def _add_heading_styled(self, doc, text, level=1):
        heading = doc.add_heading(level=level)
        run = heading.add_run(text)
        run.font.bold = True
        run.font.name = 'Arial'
        r = run._element
        r.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')
        return heading

    def _add_cover_page(self, doc, name, period_type,
                        reporting_start, reporting_end,
                        base_period_start, base_period_end,
                        has_base_period,
                        has_next=True):
        _ = self._
        img_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                '..', 'excelexporters', 'myems.png')
        if os.path.exists(img_path):
            try:
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run()
                run.add_picture(img_path, width=Inches(7.0))
            except Exception as e:
                logger.warning(f"Failed to load logo image: {e}")

        for _unused in range(2):
            doc.add_paragraph('')

        title = doc.add_paragraph()
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = title.add_run(_('Meter Data') + ' - ' + _('Offline Meter Plan'))
        run.font.size = Pt(24)
        run.font.bold = True
        run.font.name = 'Arial'
        r = run._element
        r.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')

        for _unused in range(2):
            doc.add_paragraph('')

        info_data = [
            [_('Name') + ':', name],
            [_('Period Type') + ':', period_type],
            [_('Reporting Start Datetime') + ':', reporting_start],
            [_('Reporting End Datetime') + ':', reporting_end],
        ]
        if has_base_period:
            info_data.append([_('Base Period Start Datetime') + ':', base_period_start])
            info_data.append([_('Base Period End Datetime') + ':', base_period_end])

        info_table = doc.add_table(rows=len(info_data), cols=2)
        info_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        _remove_table_borders(info_table)

        half_w = Inches(3.2)
        for i, (label, value) in enumerate(info_data):
            c_label = info_table.cell(i, 0)
            c_label.width = half_w
            c_label.text = label
            c_label.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            r_lbl = c_label.paragraphs[0].runs[0]
            r_lbl.bold = True
            r_lbl.font.size = Pt(13)
            r_lbl.font.name = 'Arial'
            r_lbl._element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')

            c_value = info_table.cell(i, 1)
            c_value.width = half_w
            c_value.text = str(value) if value is not None else ''
            c_value.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            r_val = c_value.paragraphs[0].runs[0]
            r_val.font.size = Pt(13)
            r_val.font.name = 'Arial'
            r_val._element.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')

        if has_next:
            doc.add_page_break()

    def _add_plan_summary(self, doc, has_next=True):
        """Add reporting period plan summary table (Plan vs Actual saving)."""
        _ = self._
        reporting_data = self.report['reporting_period']

        increment_rate = reporting_data.get('increment_rate_saving', None)
        increment_rate_text = str(round2(increment_rate * 100, 2)) + "%" \
            if increment_rate is not None else "-"

        col_headers = [
            '',
            self.energy_category_name + " (" + self.unit_of_measure + ")",
            _('Ton of Standard Coal') + '(TCE)',
            _('Ton of Carbon Dioxide Emissions') + '(TCO2E)' + _('Decreased')
        ]
        plan_row = [
            _('Plan'),
            str(round2(reporting_data['total_in_category_saving'], 2)),
            str(round2(reporting_data['total_in_kgce_saving'] / 1000, 2)),
            str(round2(reporting_data['total_in_kgco2e_saving'] / 1000, 2))
        ]
        increment_row = [_('Increment Rate'), increment_rate_text, increment_rate_text, increment_rate_text]

        table_data = [col_headers, plan_row, increment_row]

        self._add_heading_styled(doc, self.name + ' ' + _('Plan'), level=1)

        num_cols = len(col_headers)
        table = doc.add_table(rows=3, cols=num_cols)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        for j in range(num_cols):
            cell = table.cell(0, j)
            cell.text = col_headers[j]
            _style_table_cell(cell, is_header=True, bold=True, font_size=8)

        row_labels = [_('Plan'), _('Increment Rate')]
        for r_idx, row_label in enumerate(row_labels, start=1):
            cell = table.cell(r_idx, 0)
            cell.text = row_label
            _style_table_cell(cell, is_green=True, bold=True, font_size=8)

        for j in range(1, num_cols):
            cell_plan = table.cell(1, j)
            cell_plan.text = plan_row[j]
            _style_table_cell(cell_plan, font_size=8)

            cell_inc = table.cell(2, j)
            cell_inc.text = increment_row[j]
            _style_table_cell(cell_inc, font_size=8)

        if has_next:
            doc.add_paragraph('')
            doc.add_page_break()

    def _add_detailed_data_pages(self, doc, has_next=True):
        """Add detailed data pages: paginated tables + per-page trend line charts."""
        _ = self._

        reporting_data = self.report['reporting_period']
        reporting_times = reporting_data.get('timestamps', [])
        reporting_values = reporting_data.get('values_saving', [])

        if len(reporting_times) == 0 and not self.is_base_period_exists:
            return

        category_label = self.energy_category_name + " (" + self.unit_of_measure + ")"

        rows_per_page = 25

        if not self.is_base_period_exists:
            if len(reporting_times) == 0:
                return
            num_pages = (len(reporting_times) + rows_per_page - 1) // rows_per_page
            marker_step = max(1, rows_per_page // 15)

            for page in range(num_pages):
                start_row = page * rows_per_page
                end_row = min(start_row + rows_per_page, len(reporting_times))

                if page == 0:
                    self._add_heading_styled(doc, self.name + ' ' + _('Detailed Data'), level=1)

                container = doc.add_table(rows=2, cols=1)
                container.alignment = WD_TABLE_ALIGNMENT.CENTER
                _remove_table_borders(container)
                table_cell = container.cell(0, 0)
                chart_cell = container.cell(1, 0)

                col_headers = [_('Datetime'), category_label]
                table_data = [col_headers]
                for t_idx in range(start_row, end_row):
                    table_data.append([reporting_times[t_idx],
                                       str(round2(reporting_values[t_idx], 2))])

                table_data.append([_('Total'),
                                   str(round2(reporting_data['total_in_category_saving'], 2))])

                num_cols = len(col_headers)
                data_table = table_cell.add_table(rows=len(table_data), cols=num_cols)
                data_table.alignment = WD_TABLE_ALIGNMENT.CENTER
                p_elem = table_cell.paragraphs[0]._element
                p_elem.getparent().remove(p_elem)

                for j in range(num_cols):
                    cell = data_table.cell(0, j)
                    cell.text = col_headers[j]
                    _style_table_cell(cell, is_header=True, bold=True, font_size=8)

                for i in range(1, len(table_data) - 1):
                    for j in range(num_cols):
                        cell = data_table.cell(i, j)
                        cell.text = table_data[i][j]
                        _style_table_cell(cell, font_size=7)

                last_row = len(table_data) - 1
                for j in range(num_cols):
                    cell = data_table.cell(last_row, j)
                    cell.text = table_data[last_row][j]
                    _style_table_cell(cell, bold=True, font_size=7)

                fig, ax_chart = plt.subplots(figsize=(8.5, 2.8))
                page_data = reporting_values[start_row:end_row]
                ax_chart.plot(range(len(page_data)), page_data, linewidth=1.2,
                              color=self.chart_colors[0],
                              marker='o', markersize=3, markevery=marker_step,
                              label=category_label)
                step = max(1, (end_row - start_row) // 8)
                ax_chart.set_xticks(range(0, end_row - start_row, step))
                ax_chart.set_xticklabels([reporting_times[start_row + t]
                                          for t in range(0, end_row - start_row, step)],
                                         rotation=45, ha='right', fontsize=7)
                ax_chart.set_title(_('Reporting Period Plan') + ' - ' + category_label,
                                   fontsize=10, weight='bold')
                ax_chart.legend(fontsize=7, loc='upper right')
                ax_chart.grid(True, alpha=0.3)
                chart_buf = self._fig_to_bytesio(fig, self.dpi)

                p = chart_cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run()
                run.add_picture(chart_buf, width=Inches(8.5))

                if page < num_pages - 1:
                    doc.add_page_break()
        else:
            base_period_data = self.report['base_period']
            base_times = base_period_data.get('timestamps', [])
            base_values = base_period_data.get('values_saving', [])

            total_rows = max(len(reporting_times), len(base_times))
            if total_rows == 0:
                return
            num_pages = (total_rows + rows_per_page - 1) // rows_per_page
            marker_step = max(1, rows_per_page // 15)

            for page in range(num_pages):
                start_row = page * rows_per_page
                end_row = min(start_row + rows_per_page, total_rows)

                if page == 0:
                    self._add_heading_styled(doc, self.name + ' ' + _('Detailed Data'), level=1)

                container = doc.add_table(rows=2, cols=1)
                container.alignment = WD_TABLE_ALIGNMENT.CENTER
                _remove_table_borders(container)
                table_cell = container.cell(0, 0)
                chart_cell = container.cell(1, 0)

                col_headers = [
                    _('Base Period') + ' - ' + _('Datetime'),
                    _('Base Period') + ' - ' + category_label,
                    _('Reporting Period') + ' - ' + _('Datetime'),
                    _('Reporting Period') + ' - ' + category_label
                ]
                table_data = [col_headers]
                for t_idx in range(start_row, end_row):
                    base_time = base_times[t_idx] if t_idx < len(base_times) else ''
                    base_value = str(round2(base_values[t_idx], 2)) \
                        if t_idx < len(base_values) else ''
                    rep_time = reporting_times[t_idx] if t_idx < len(reporting_times) else ''
                    rep_value = str(round2(reporting_values[t_idx], 2)) \
                        if t_idx < len(reporting_values) else ''
                    table_data.append([base_time, base_value, rep_time, rep_value])

                table_data.append([_('Total'),
                                   str(round2(base_period_data['total_in_category_saving'], 2)),
                                   _('Total'),
                                   str(round2(reporting_data['total_in_category_saving'], 2))])

                num_cols = len(col_headers)
                data_table = table_cell.add_table(rows=len(table_data), cols=num_cols)
                data_table.alignment = WD_TABLE_ALIGNMENT.CENTER

                for j in range(num_cols):
                    cell = data_table.cell(0, j)
                    cell.text = col_headers[j]
                    _style_table_cell(cell, is_header=True, bold=True, font_size=7)

                for i in range(1, len(table_data) - 1):
                    for j in range(num_cols):
                        cell = data_table.cell(i, j)
                        cell.text = table_data[i][j]
                        _style_table_cell(cell, font_size=6)

                last_row = len(table_data) - 1
                for j in range(num_cols):
                    cell = data_table.cell(last_row, j)
                    cell.text = table_data[last_row][j]
                    _style_table_cell(cell, bold=True, font_size=6)

                fig, ax_chart = plt.subplots(figsize=(8.5, 2.8))
                page_data = reporting_values[start_row:min(end_row, len(reporting_values))]
                ax_chart.plot(range(len(page_data)), page_data, linewidth=1.2,
                              color=self.chart_colors[0],
                              marker='o', markersize=3, markevery=marker_step,
                              label=_('Reporting Period') + ' - ' + category_label)
                base_page_data = base_values[start_row:min(end_row, len(base_values))]
                ax_chart.plot(range(len(base_page_data)), base_page_data, linewidth=1.2,
                              color=self.chart_colors[1], linestyle='--',
                              marker='s', markersize=3, markevery=marker_step,
                              label=_('Base Period') + ' - ' + category_label)
                page_len = end_row - start_row
                step = max(1, page_len // 8)
                tick_positions = []
                tick_labels = []
                for t in range(0, page_len, step):
                    idx = start_row + t
                    if idx < len(reporting_times):
                        tick_positions.append(t)
                        tick_labels.append(reporting_times[idx])
                ax_chart.set_xticks(tick_positions)
                ax_chart.set_xticklabels(tick_labels, rotation=45, ha='right', fontsize=7)
                ax_chart.set_title(_('Base Period Plan') + ' / ' + _('Reporting Period Plan') + ' - ' + category_label,
                                   fontsize=10, weight='bold')
                ax_chart.legend(fontsize=7, loc='upper right')
                ax_chart.grid(True, alpha=0.3)
                chart_buf = self._fig_to_bytesio(fig, self.dpi)

                p = chart_cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run()
                run.add_picture(chart_buf, width=Inches(8.5))

                if page < num_pages - 1:
                    doc.add_page_break()

        if has_next:
            doc.add_page_break()

    @staticmethod
    def _has_valid_parameters(params: Dict) -> bool:
        if not params or not params.get('names') or not params.get('timestamps'):
            return False

        param_names = params.get('names', [])
        timestamps = params.get('timestamps', [])
        values = params.get('values', [])

        for ts_list in timestamps:
            if ts_list and len(ts_list) > 0:
                break
        else:
            return False

        for i in range(len(param_names)):
            if i < len(timestamps) and len(timestamps[i]) > 0:
                if i < len(values) and len(values[i]) > 0:
                    return True
        return False

    def _add_parameters_section(self, doc):
        """Add parameters section: each parameter with compact table + filled line chart."""
        _ = self._

        params = self.report.get('parameters', {})
        if not params or not params.get('names') or not params.get('timestamps'):
            return

        param_names = params.get('names', [])
        timestamps = params.get('timestamps', [])
        values = params.get('values', [])

        all_zero = True
        for ts_list in timestamps:
            if ts_list and len(ts_list) > 0:
                all_zero = False
                break
        if all_zero:
            return

        all_params = list(range(len(param_names)))
        valid_params = []
        for i in all_params:
            if i < len(timestamps) and len(timestamps[i]) > 0:
                if i < len(values) and len(values[i]) > 0:
                    valid_params.append(i)
        if not valid_params:
            return

        self._add_heading_styled(doc, self.name + ' ' + _('Parameters'), level=1)

        rows_per_param = 10

        for pi in valid_params:
            name = param_names[pi]
            times = timestamps[pi]
            data = values[pi]
            data_len = len(times)

            tbl_rows = min(rows_per_param, data_len)

            fig, ax = plt.subplots(figsize=(5.0, 2.4))
            marker_step_p = max(1, data_len // 20)
            color = '#5B9BD5'
            ax.plot(range(data_len), data, linewidth=1.2,
                    color=color, marker='o', markersize=3,
                    markevery=marker_step_p, label=name)
            ax.fill_between(range(data_len), data, alpha=0.15, color=color)
            step = max(1, data_len // 8)
            ax.set_xticks(range(0, data_len, step))
            ax.set_xticklabels([times[t][:10] for t in range(0, data_len, step)],
                               rotation=45, ha='right', fontsize=6)
            ax.set_ylabel(name, fontsize=8)
            ax.set_title(_('Parameters') + ' - ' + name,
                         fontsize=9, fontweight='bold')
            ax.grid(True, alpha=0.3)
            chart_buf = self._fig_to_bytesio(fig, self.dpi)

            container = doc.add_table(rows=1, cols=2)
            container.alignment = WD_TABLE_ALIGNMENT.CENTER
            _remove_table_borders(container)
            left_cell = container.cell(0, 0)
            right_cell = container.cell(0, 1)

            data_table = left_cell.add_table(rows=tbl_rows + 1, cols=2)
            data_table.alignment = WD_TABLE_ALIGNMENT.CENTER
            h0 = data_table.cell(0, 0)
            h0.text = _('Time')
            _style_table_cell(h0, is_header=True, bold=True, font_size=8)
            h1 = data_table.cell(0, 1)
            h1.text = name
            _style_table_cell(h1, is_header=True, bold=True, font_size=8)
            for j in range(tbl_rows):
                c_t = data_table.cell(j + 1, 0)
                c_t.text = str(times[j])
                _style_table_cell(c_t, font_size=7)
                c_v = data_table.cell(j + 1, 1)
                c_v.text = str(round2(data[j], 2))
                _style_table_cell(c_v, font_size=7)

            p = right_cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run()
            run.add_picture(chart_buf, width=Inches(4.5))

    def _is_base_period_timestamp_exists(self, base_period_data: Dict) -> bool:
        timestamps = base_period_data.get('timestamps', [])

        if not timestamps:
            return False

        for timestamp in timestamps:
            if timestamp and len(timestamp) > 0:
                return True

        return False


def export(report,
           name,
           base_period_start_datetime_local,
           base_period_end_datetime_local,
           reporting_start_datetime_local,
           reporting_end_datetime_local,
           period_type,
           language):
    """
    Export offline meter report data to DOCX and return base64 encoded string.
    This function maintains the same interface as the Excel exporter.
    """
    exporter = OfflineMeterPlanDOCXExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
