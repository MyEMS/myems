"""
Offline Meter Energy DOCX Exporter

This module provides functionality to export offline meter energy data to DOCX format.
It generates comprehensive reports showing energy consumption for offline meters
with detailed analysis including base period comparison and time-series data.

Key Features:
- Offline meter energy consumption analysis
- Base period vs reporting period comparison
- Detailed data with line charts
- Parameter data (if available)
- Multi-language support
- Base64 encoding for file transmission

The exported DOCX file includes:
- Cover page with logo and report metadata
- Reporting period consumption summary table
- Detailed time-series paginated tables + per-page trend line charts
- Parameter data (sensors, tariffs, etc.) tables + line charts with filled area
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
from docx.enum.section import WD_SECTION
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

from core.utilities import get_translation, round2
from .docxcommon import configure_cover_section, configure_body_section

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
    if not cell.paragraphs[0].runs:
        cell.paragraphs[0].add_run('')
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


class OfflineMeterEnergyDOCXExporter:
    """
    Export offline meter energy consumption data to DOCX format.
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

    @staticmethod
    def _filter_valid_data(data):
        xs, ys = [], []
        for idx, v in enumerate(data):
            if v is not None:
                try:
                    ys.append(float(v))
                    xs.append(idx)
                except (TypeError, ValueError):
                    pass
        return xs, ys

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

        if "reporting_period" not in report.keys() or \
                "values" not in report['reporting_period'].keys() or \
                len(report['reporting_period']['values']) == 0:
            doc = Document()
            section = doc.sections[0]
            section.orientation = 1
            section.page_width = Inches(11.69)
            section.page_height = Inches(8.27)
            self._add_cover_page(doc, name, period_type,
                                 reporting_start_datetime_local,
                                 reporting_end_datetime_local,
                                 base_period_start_datetime_local,
                                 base_period_end_datetime_local,
                                 False)
            self.name = name
            configure_cover_section(doc.sections[0])
            filename = str(uuid.uuid4()) + '.docx'
            doc.save(filename)
            return filename

        filename = str(uuid.uuid4()) + '.docx'

        self.report = _convert_decimals(report)
        self.name = name
        self.reporting_start = reporting_start_datetime_local
        self.reporting_end = reporting_end_datetime_local
        self.base_period_start = base_period_start_datetime_local
        self.base_period_end = base_period_end_datetime_local
        self.period_type = period_type

        self.energy_category_name = self.report['offline_meter']['energy_category_name']
        self.unit_of_measure = self.report['offline_meter']['unit_of_measure']

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

        self._add_cover_page(doc, name, period_type,
                             reporting_start_datetime_local,
                             reporting_end_datetime_local,
                             base_period_start_datetime_local,
                             base_period_end_datetime_local,
                             self.is_base_period_exists)

        configure_cover_section(doc.sections[0])

        self._add_consumption_summary(doc)
        if len(reporting_times) > 0:
            if has_detailed:
                self._add_detailed_data_table(doc)
                self._add_detailed_data_charts(doc)
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
                        has_base_period):
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
        run = title.add_run(_('Meter Data') + ' - ' + _('Offline Meter Energy'))
        run.font.size = Pt(24)
        run.font.bold = True
        run.font.name = 'Arial'
        r = run._element
        r.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')

        for _unused in range(2):
            doc.add_paragraph('')

        info_data = [
            [_('Name') + ':', name],
            [_('Period Type') + ':', _(period_type)],
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

    def _add_consumption_summary(self, doc):
        """Add reporting period consumption summary table."""
        _ = self._
        reporting_data = self.report['reporting_period']
        base_period_data = self.report['base_period']

        body_section = doc.add_section(WD_SECTION.NEW_PAGE)
        body_section.orientation = 1
        body_section.page_width = Inches(11.69)
        body_section.page_height = Inches(8.27)
        body_section.left_margin = Inches(0.5)
        body_section.right_margin = Inches(0.5)
        body_section.top_margin = Inches(0.5)
        body_section.bottom_margin = Inches(0.5)
        header_title = _('Meter Data') + ' - ' + _('Offline Meter Energy') + '  |  ' + self.name
        configure_body_section(body_section, header_title=header_title)

        increment_rate = reporting_data.get('increment_rate', None)
        increment_rate_text = str(round2(increment_rate * 100, 2)) + "%" \
            if increment_rate is not None else "-"

        category_label = self.energy_category_name + " (" + self.unit_of_measure + ")"

        col_headers = [
            '',
            category_label,
        ]
        base_total_str = str(round2(base_period_data['total_in_category'], 2)) \
            if self.is_base_period_exists else "-"
        base_row = [_('Base Period'), base_total_str]
        reporting_row = [
            _('Reporting Period'),
            str(round2(reporting_data['total_in_category'], 2)),
        ]
        increment_row = [_('Increment Rate'), increment_rate_text]

        table_data = [col_headers, base_row, reporting_row, increment_row]

        self._add_heading_styled(doc, self.name + ' - ' + _('Reporting Period Consumption'), level=1)

        num_cols = len(col_headers)
        table = doc.add_table(rows=4, cols=num_cols)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        for j in range(num_cols):
            cell = table.cell(0, j)
            cell.text = col_headers[j]
            _style_table_cell(cell, is_green=True, bold=True, font_size=8)

        row_labels = [_('Base Period'), _('Reporting Period'), _('Increment Rate')]
        for r_idx, row_label in enumerate(row_labels, start=1):
            cell = table.cell(r_idx, 0)
            cell.text = row_label
            _style_table_cell(cell, bold=True)

        for r_idx in [1, 2, 3]:
            for j in range(1, num_cols):
                cell = table.cell(r_idx, j)
                cell.text = str(table_data[r_idx][j])
                _style_table_cell(cell, font_size=8)

    def _add_detailed_data_table(self, doc):
        _ = self._

        reporting_data = self.report['reporting_period']
        reporting_times = reporting_data.get('timestamps', [])
        reporting_values = reporting_data.get('values', [])

        if len(reporting_times) == 0 and not self.is_base_period_exists:
            return

        doc.add_page_break()
        self._add_heading_styled(doc, self.name + ' ' + _('Detailed Data'), level=1)

        category_label = self.energy_category_name + " (" + self.unit_of_measure + ")"

        rows_per_table_page = 45
        header_font = 8
        data_font = 7

        first_table_page = True

        if not self.is_base_period_exists:
            if len(reporting_times) == 0:
                return
            num_rows = len(reporting_times)
            num_pages = (num_rows + rows_per_table_page - 1) // rows_per_table_page

            col_headers = [_('Datetime'), category_label]
            num_cols = len(col_headers)

            for page in range(num_pages):
                start_row = page * rows_per_table_page
                end_row = min(start_row + rows_per_table_page, num_rows)
                is_last_page = (end_row == num_rows)

                if not first_table_page:
                    doc.add_page_break()
                first_table_page = False

                table_data = [col_headers]
                for t_idx in range(start_row, end_row):
                    table_data.append([reporting_times[t_idx],
                                       str(round2(reporting_values[t_idx], 2))])

                if is_last_page:
                    table_data.append([_('Total'),
                                       str(round2(reporting_data['total_in_category'], 2))])

                data_table = doc.add_table(rows=len(table_data), cols=num_cols)
                data_table.alignment = WD_TABLE_ALIGNMENT.CENTER

                for j in range(num_cols):
                    cell = data_table.cell(0, j)
                    cell.text = col_headers[j]
                    _style_table_cell(cell, is_header=True, bold=True, font_size=header_font)

                for i in range(1, len(table_data) - (1 if is_last_page else 0)):
                    for j in range(num_cols):
                        cell = data_table.cell(i, j)
                        cell.text = table_data[i][j]
                        _style_table_cell(cell, font_size=data_font)

                if is_last_page:
                    last_row = len(table_data) - 1
                    for j in range(num_cols):
                        cell = data_table.cell(last_row, j)
                        cell.text = table_data[last_row][j]
                        _style_table_cell(cell, bold=True, font_size=data_font)
        else:
            base_period_data = self.report['base_period']
            base_times = base_period_data.get('timestamps', [])
            base_values = base_period_data.get('values', [])

            total_rows = max(len(reporting_times), len(base_times))
            if total_rows == 0:
                return
            num_pages = (total_rows + rows_per_table_page - 1) // rows_per_table_page

            col_headers = [
                _('Base Period') + ' - ' + _('Datetime'),
                _('Base Period') + ' - ' + category_label,
                _('Reporting Period') + ' - ' + _('Datetime'),
                _('Reporting Period') + ' - ' + category_label
            ]
            num_cols = len(col_headers)

            for page in range(num_pages):
                start_row = page * rows_per_table_page
                end_row = min(start_row + rows_per_table_page, total_rows)
                is_last_page = (end_row == total_rows)

                if not first_table_page:
                    doc.add_page_break()
                first_table_page = False

                table_data = [col_headers]
                for t_idx in range(start_row, end_row):
                    base_time = base_times[t_idx] if t_idx < len(base_times) else ''
                    base_value = str(round2(base_values[t_idx], 2)) \
                        if t_idx < len(base_values) else ''
                    rep_time = reporting_times[t_idx] if t_idx < len(reporting_times) else ''
                    rep_value = str(round2(reporting_values[t_idx], 2)) \
                        if t_idx < len(reporting_values) else ''
                    table_data.append([base_time, base_value, rep_time, rep_value])

                if is_last_page:
                    table_data.append([_('Total'),
                                       str(round2(base_period_data['total_in_category'], 2)),
                                       _('Total'),
                                       str(round2(reporting_data['total_in_category'], 2))])

                data_table = doc.add_table(rows=len(table_data), cols=num_cols)
                data_table.alignment = WD_TABLE_ALIGNMENT.CENTER

                for j in range(num_cols):
                    cell = data_table.cell(0, j)
                    cell.text = col_headers[j]
                    _style_table_cell(cell, is_header=True, bold=True, font_size=header_font)

                for i in range(1, len(table_data) - (1 if is_last_page else 0)):
                    for j in range(num_cols):
                        cell = data_table.cell(i, j)
                        cell.text = table_data[i][j]
                        _style_table_cell(cell, font_size=data_font)

                if is_last_page:
                    last_row = len(table_data) - 1
                    for j in range(num_cols):
                        cell = data_table.cell(last_row, j)
                        cell.text = table_data[last_row][j]
                        _style_table_cell(cell, bold=True, font_size=data_font)

    def _add_detailed_data_charts(self, doc):
        _ = self._

        reporting_data = self.report['reporting_period']
        reporting_times = reporting_data.get('timestamps', [])
        reporting_values = reporting_data.get('values', [])

        if len(reporting_times) == 0 and not self.is_base_period_exists:
            return

        category_label = self.energy_category_name + " (" + self.unit_of_measure + ")"

        doc.add_page_break()
        self._add_heading_styled(doc, self.name + ' ' + _('Detailed Data'), level=1)

        def _set_ticks(ax, raw_len, times):
            step = max(1, raw_len // 10)
            ax.set_xticks(range(0, raw_len, step))
            ax.set_xticklabels(
                [times[t][:10] if t < len(times) else '' for t in range(0, raw_len, step)],
                rotation=45, ha='right', fontsize=7)

        all_charts = []
        fig_w, fig_h = 10.5, 3.2
        display_w = 10.5

        is_base = self.is_base_period_exists
        if not is_base:
            raw_len = len(reporting_times)
            fig, ax = plt.subplots(figsize=(fig_w, fig_h))
            r_xs, r_ys = self._filter_valid_data(reporting_values)
            marker_step = max(1, len(r_ys) // 30) if r_ys else 1
            if r_ys:
                ax.plot(r_xs, r_ys, linewidth=1.2,
                        color=self.chart_colors[0],
                        marker='o', markersize=3,
                        markevery=marker_step,
                        label=category_label)
            _set_ticks(ax, raw_len, reporting_times)
            title = _('Reporting Period Consumption') + ' - ' + category_label
            ax.set_title(title, fontsize=9, fontweight='bold')
            if r_ys:
                ax.legend(fontsize=7)
            ax.grid(True, alpha=0.3)
            all_charts.append(self._fig_to_bytesio(fig, self.dpi))
        else:
            base_period_data = self.report['base_period']
            base_times = base_period_data.get('timestamps', [])
            base_values = base_period_data.get('values', [])
            raw_len = max(len(reporting_times), len(base_times))
            fig, ax = plt.subplots(figsize=(fig_w, fig_h))
            r_xs, r_ys = self._filter_valid_data(reporting_values)
            marker_step = max(1, len(r_ys) // 30) if r_ys else 1
            if r_ys:
                ax.plot(r_xs, r_ys, linewidth=1.2,
                        color=self.chart_colors[0],
                        marker='o', markersize=3,
                        markevery=marker_step,
                        label=_('Reporting Period') + ' - ' + category_label)
            b_xs, b_ys = self._filter_valid_data(base_values)
            marker_step_b = max(1, len(b_ys) // 30) if b_ys else 1
            if b_ys:
                ax.plot(b_xs, b_ys, linewidth=1.2,
                        color=self.chart_colors[1],
                        linestyle='--', marker='s', markersize=3,
                        markevery=marker_step_b,
                        label=_('Base Period') + ' - ' + category_label)
            _set_ticks(ax, raw_len, reporting_times)
            title = _('Base Period Consumption') + ' / ' + \
                    _('Reporting Period Consumption') + ' - ' + category_label
            ax.set_title(title, fontsize=9, fontweight='bold')
            ax.legend(fontsize=7)
            ax.grid(True, alpha=0.3)
            all_charts.append(self._fig_to_bytesio(fig, self.dpi))

        num_total_charts = len(all_charts)
        charts_per_page = 2
        first_chart_page = True

        for page_start in range(0, num_total_charts, charts_per_page):
            page_end = min(page_start + charts_per_page, num_total_charts)
            page_bufs = all_charts[page_start:page_end]
            num_on_page = len(page_bufs)

            if not first_chart_page:
                doc.add_page_break()
            first_chart_page = False

            if num_on_page == 1:
                chart_buf = page_bufs[0]
                p = doc.add_paragraph()
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = p.add_run()
                run.add_picture(chart_buf, width=Inches(display_w))
            elif num_on_page == 2:
                container = doc.add_table(rows=2, cols=1)
                container.alignment = WD_TABLE_ALIGNMENT.CENTER
                _remove_table_borders(container)
                for ci, buf in enumerate(page_bufs):
                    cell = container.cell(ci, 0)
                    p = cell.paragraphs[0]
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    run = p.add_run()
                    run.add_picture(buf, width=Inches(display_w))

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

        doc.add_page_break()
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
    This function maintains the same interface as the PDF exporter.
    """
    exporter = OfflineMeterEnergyDOCXExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
