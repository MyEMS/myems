"""
Tenant Energy Item DOCX Exporter

This module provides functionality to export tenant energy item data to DOCX format.
It generates comprehensive reports showing consumption analysis at energy item level,
grouped by energy categories (table + pie chart per group).

Key Features:
- Tenant energy item analysis grouped by energy category
- Summary table (Consumption / Per Unit Area / Per Capita / Growth Rate
  x items + TCE + TCO2E)
- Detailed breakdown: per category group (item level table + pie chart)
- Detailed data charts (2x2 paginated) + parameters with filled area charts

The exported DOCX file includes:
- Cover page with logo and report metadata (Tenant Data - Energy Item Analysis)
- Item-level summary tables (spacecost style top summary)
- Per-category pages: left item table + right pie
- Detailed data charts (paginated 2x2)
- Parameters
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
        logger.info("Successfully loaded bundled font: %s from %s", font_name, font_path)
        _font_setup_done = True
        return True
    except Exception as e:
        logger.warning("Failed to load bundled font from %s: %s", font_path, e)

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
        m = OxmlElement('w:' + side)
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
        border = OxmlElement('w:' + border_name)
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
        border = OxmlElement('w:' + border_name)
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


class TenantEnergyItemDOCXExporter:
    """
    Export tenant energy item data to DOCX format.
    Layout follows spacecost.py top summary + per category grouped breakdown.
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
        logger.info("Starting DOCX generation for %s", name)

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
                logger.error("Failed to encode DOCX: %s", str(e))
            finally:
                try:
                    os.remove(docx_filename)
                except Exception:
                    pass
        elapsed = time.time() - start_time
        logger.info("DOCX generation completed in %.2fs for %s", elapsed, name)
        return result

    @staticmethod
    def _fig_to_bytesio(fig, dpi: int) -> BinaryIO:
        buf = io.BytesIO()
        fig.tight_layout()
        fig.savefig(buf, format='png', dpi=dpi, bbox_inches='tight')
        plt.close(fig)
        buf.seek(0)
        return buf

    def _make_pie_chart(self, values, labels, title, colors=None):
        if not values or sum((v or 0) for v in values) == 0:
            return None
        fig, ax = plt.subplots(figsize=(3.2, 2.6))
        if colors is None:
            colors = self.chart_colors[:len(labels)]
        filtered = [(l, v, c) for l, v, c in zip(labels, values, colors) if (v or 0) > 0]
        if not filtered:
            plt.close(fig)
            return None
        f_labels, f_values, f_colors = zip(*filtered)
        if len(f_labels) > 8:
            sorted_data = sorted(zip(f_labels, f_values, f_colors), key=lambda x: x[1], reverse=True)
            top_data = sorted_data[:7]
            other_sum = sum(v for _, v, _ in sorted_data[7:])
            f_labels = [l for l, _, _ in top_data] + [self._('Others')]
            f_values = [v for _, v, _ in top_data] + [other_sum]
            f_colors = [c for _, _, c in top_data] + ['#999999']
        ax.pie(f_values, labels=f_labels, autopct='%1.1f%%', colors=f_colors, startangle=90)
        ax.set_title(title, fontsize=10, fontweight='bold')
        return self._fig_to_bytesio(fig, self.dpi)

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
                "names" not in report['reporting_period'].keys() or \
                len(report['reporting_period']['names']) == 0:
            doc = Document()
            section = doc.sections[0]
            section.orientation = 1
            section.page_width = Inches(11.69)
            section.page_height = Inches(8.27)
            section.left_margin = Inches(0.5)
            section.right_margin = Inches(0.5)
            section.top_margin = Inches(0.5)
            section.bottom_margin = Inches(0.5)
            self._add_cover_page(doc, name, period_type,
                                 reporting_start_datetime_local,
                                 reporting_end_datetime_local,
                                 base_period_start_datetime_local,
                                 base_period_end_datetime_local,
                                 False,
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

        self.is_base_period_exists = self._is_base_period_timestamp_exists(
            report.get('base_period', {}))

        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        timestamps = reporting_data.get('timestamps', [])
        has_combined = len(names) > 0
        has_grouped = len(names) > 0
        has_detailed = (timestamps and len(timestamps) > 0 and len(timestamps[0]) > 0
                        and names and len(names) > 0)
        has_params = self._has_valid_parameters(self.report.get('parameters', {}))

        doc = Document()
        section = doc.sections[0]
        section.orientation = 1
        section.page_width = Inches(11.69)
        section.page_height = Inches(8.27)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)

        self._add_cover_page(doc, name, period_type,
                             reporting_start_datetime_local,
                             reporting_end_datetime_local,
                             base_period_start_datetime_local,
                             base_period_end_datetime_local,
                             self.is_base_period_exists,
                             has_next=(has_combined or has_grouped or has_detailed or has_params))

        self._add_combined_analysis_section(doc,
                                            has_next=(has_grouped or has_detailed or has_params))
        self._add_grouped_category_breakdown(doc)
        self._add_detailed_data_charts(doc, has_next=has_params)
        self._add_parameters_section(doc)

        doc.save(filename)
        logger.info("DOCX generated: %s", filename)
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
                logger.warning("Failed to load logo image: %s", e)

        for _unused in range(2):
            doc.add_paragraph('')

        title = doc.add_paragraph()
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = title.add_run(_('Tenant Data') + ' - ' + _('Energy Item Analysis'))
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

    def _add_combined_analysis_section(self, doc, has_next=True):
        """spacecost style: top summary table."""
        _ = self._

        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        subtotals = reporting_data.get('subtotals', [])
        subtotals_per_unit_area = reporting_data.get('subtotals_per_unit_area', [])
        subtotals_per_capita = reporting_data.get('subtotals_per_capita', [])
        increment_rates = reporting_data.get('increment_rates', [])
        subtotals_in_kgce = reporting_data.get('subtotals_in_kgce', [])
        subtotals_in_kgco2e = reporting_data.get('subtotals_in_kgco2e', [])

        num_items = len(names)
        if num_items == 0:
            return

        self._add_heading_styled(doc, self.name + ' - ' +
                                 _('Reporting Period Energy Item Analysis'), level=1)

        num_cols = num_items + 3
        table = doc.add_table(rows=5, cols=num_cols)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        headers = ['']
        for j in range(num_items):
            unit_j = units[j] if (units and j < len(units)) else ''
            headers.append(names[j] + ' (' + unit_j + ')')
        headers.append(_('Ton of Standard Coal') + ' (TCE)')
        headers.append(_('Ton of Carbon Dioxide Emissions') + ' (TCO2E)')

        for j, h in enumerate(headers):
            c_h = table.cell(0, j)
            c_h.text = h
            _style_table_cell(c_h, is_header=True, bold=True, font_size=8)

        total_in_kgce = reporting_data.get('total_in_kgce', 0)
        total_in_kgco2e = reporting_data.get('total_in_kgco2e', 0)
        total_kgce_pua = reporting_data.get('total_in_kgce_per_unit_area', None)
        total_kgco2e_pua = reporting_data.get('total_in_kgco2e_per_unit_area', None)
        total_kgce_pc = reporting_data.get('total_in_kgce_per_capita', None)
        total_kgco2e_pc = reporting_data.get('total_in_kgco2e_per_capita', None)
        inc_kgce = reporting_data.get('increment_rate_in_kgce', None)
        inc_kgco2e = reporting_data.get('increment_rate_in_kgco2e', None)

        row_data = [
            (1, _('Consumption'), subtotals,
             str(round2(total_in_kgce / 1000, 2)),
             str(round2(total_in_kgco2e / 1000, 2))),
            (2, _('Per Unit Area'), subtotals_per_unit_area,
             (str(round2(total_kgce_pua / 1000, 2)) if total_kgce_pua is not None else ''),
             (str(round2(total_kgco2e_pua / 1000, 2)) if total_kgco2e_pua is not None else '')),
            (3, _('Per Capita'), subtotals_per_capita,
             (str(round2(total_kgce_pc / 1000, 2)) if total_kgce_pc is not None else ''),
             (str(round2(total_kgco2e_pc / 1000, 2)) if total_kgco2e_pc is not None else '')),
            (4, _('Growth Rate'), increment_rates,
             (str(round2(inc_kgce * 100, 2)) + '%') if inc_kgce is not None else '',
             (str(round2(inc_kgco2e * 100, 2)) + '%') if inc_kgco2e is not None else ''),
        ]

        for r_idx, row_label, field_list, tce_text, co2e_text in row_data:
            c_rl = table.cell(r_idx, 0)
            c_rl.text = row_label
            _style_table_cell(c_rl, is_green=True, bold=True, font_size=8)
            is_pct = (row_label == _('Growth Rate'))
            for j in range(num_items):
                val = field_list[j] if (field_list and j < len(field_list)) else None
                if val is None:
                    text_v = ''
                elif is_pct:
                    text_v = str(round2(val * 100, 2)) + '%'
                else:
                    text_v = str(round2(val, 2))
                c_val = table.cell(r_idx, j + 1)
                c_val.text = text_v
                _style_table_cell(c_val, font_size=8)
            tce_col = num_items + 1
            co2e_col = num_items + 2
            c_tce = table.cell(r_idx, tce_col)
            c_tce.text = tce_text
            _style_table_cell(c_tce, font_size=8)
            c_co2e = table.cell(r_idx, co2e_col)
            c_co2e.text = co2e_text
            _style_table_cell(c_co2e, font_size=8)

        if has_next:
            doc.add_page_break()

    def _add_grouped_category_breakdown(self, doc):
        """PDF source style: grouped by energy_category with left table + right pie."""
        _ = self._
        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        subtotals = reporting_data.get('subtotals', [])
        energy_category_names = reporting_data.get('energy_category_names', [])

        num_items = len(names)
        if num_items == 0:
            return

        # Build per-category groups
        cat_to_items: Dict[str, List[int]] = {}
        ordered_cats: List[str] = []
        for i in range(num_items):
            cat_name = (energy_category_names[i]
                        if (energy_category_names and i < len(energy_category_names))
                        else _('Unknown Category'))
            if cat_name not in cat_to_items:
                cat_to_items[cat_name] = []
                ordered_cats.append(cat_name)
            cat_to_items[cat_name].append(i)

        self._add_heading_styled(doc,
                                 self.name + ' ' + _('Energy Item by Category'), level=1)

        for cat in ordered_cats:
            item_indices = cat_to_items[cat]
            n_items = len(item_indices)

            item_names = [names[i] for i in item_indices]
            item_subtotals = [
                (subtotals[i] if (subtotals and i < len(subtotals)) else 0)
                for i in item_indices
            ]
            item_units = [
                (units[i] if (units and i < len(units)) else '')
                for i in item_indices
            ]
            cat_total = sum((v or 0) for v in item_subtotals) or 1

            outer = doc.add_table(rows=1, cols=2)
            outer.alignment = WD_TABLE_ALIGNMENT.CENTER
            _remove_table_borders(outer)
            left_cell = outer.cell(0, 0)
            right_cell = outer.cell(0, 1)

            hdr = self._add_heading_styled(left_cell,
                                           _('Energy Category') + ' - ' + cat,
                                           level=2)

            tbl = left_cell.add_table(rows=n_items + 2, cols=4)
            tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
            th0 = tbl.cell(0, 0)
            th0.text = ''
            _style_table_cell(th0, is_header=True, bold=True, font_size=8)
            th1 = tbl.cell(0, 1)
            th1.text = _('Energy Item')
            _style_table_cell(th1, is_header=True, bold=True, font_size=8)
            th2 = tbl.cell(0, 2)
            th2.text = _('Consumption')
            _style_table_cell(th2, is_header=True, bold=True, font_size=8)
            th3 = tbl.cell(0, 3)
            th3.text = _('Ratio')
            _style_table_cell(th3, is_header=True, bold=True, font_size=8)

            for k, i in enumerate(item_indices):
                row = k + 1
                c0 = tbl.cell(row, 0)
                c0.text = str(k + 1)
                _style_table_cell(c0, font_size=8)
                c1 = tbl.cell(row, 1)
                c1.text = names[i] + ' (' + item_units[k] + ')'
                _style_table_cell(c1, bold=True, font_size=8)
                c2 = tbl.cell(row, 2)
                c2.text = str(round2(item_subtotals[k], 2))
                _style_table_cell(c2, font_size=8)
                c3 = tbl.cell(row, 3)
                ratio = (str(round2(item_subtotals[k] / cat_total * 100, 2)) + '%'
                         if abs(cat_total) > 0 else '-')
                c3.text = ratio
                _style_table_cell(c3, font_size=8)

            tc0 = tbl.cell(n_items + 1, 0)
            tc0.merge(tbl.cell(n_items + 1, 1))
            tc0.text = _('Total')
            _style_table_cell(tc0, is_green=True, bold=True, font_size=8)
            tc2 = tbl.cell(n_items + 1, 2)
            tc2.text = str(round2(cat_total, 2))
            _style_table_cell(tc2, bold=True, font_size=8)
            tc3 = tbl.cell(n_items + 1, 3)
            tc3.text = '100%'
            _style_table_cell(tc3, bold=True, font_size=8)

            pie = self._make_pie_chart(
                [round2((item_subtotals[k] or 0), 2) for k in range(n_items)],
                item_names,
                cat + ' - ' + _('Ratio'))
            if pie:
                pr = right_cell.paragraphs[0]
                pr.alignment = WD_ALIGN_PARAGRAPH.CENTER
                run = pr.add_run()
                run.add_picture(pie, width=Inches(3.5))

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

    def _add_detailed_data_charts(self, doc, has_next=True):
        _ = self._

        reporting_data = self.report['reporting_period']
        timestamps = reporting_data.get('timestamps', [])
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        values = reporting_data.get('values', [])
        subtotals = reporting_data.get('subtotals', [])

        if not timestamps or len(timestamps[0]) == 0 or not names:
            return

        reporting_times = timestamps[0]
        num_items = len(names)
        rows_per_page = 25

        doc.add_page_break()

        if not self.is_base_period_exists:
            first_item = True
            for i in range(num_items):
                color = self.chart_colors[i % len(self.chart_colors)]
                unit_i = units[i] if (units and i < len(units)) else ''
                raw_data = values[i] if i < len(values) else []
                total_rows = max(len(raw_data), len(reporting_times))
                if total_rows == 0:
                    continue
                num_pages = (total_rows + rows_per_page - 1) // rows_per_page
                for page in range(num_pages):
                    start_row = page * rows_per_page
                    end_row = min(start_row + rows_per_page, total_rows)
                    if first_item and page == 0:
                        self._add_heading_styled(doc, self.name + ' ' + _('Detailed Data'), level=1)
                        first_item = False
                    container = doc.add_table(rows=2, cols=1)
                    container.alignment = WD_TABLE_ALIGNMENT.CENTER
                    _remove_table_borders(container)
                    table_cell = container.cell(0, 0)
                    chart_cell = container.cell(1, 0)
                    col_headers = [_('Datetime'), names[i] + ' (' + unit_i + ')']
                    table_data = [col_headers]
                    for t_idx in range(start_row, end_row):
                        row_vals = [reporting_times[t_idx] if t_idx < len(reporting_times) else '']
                        v = raw_data[t_idx] if t_idx < len(raw_data) else None
                        row_vals.append(str(round2(v, 2)) if v is not None else '')
                        table_data.append(row_vals)
                    total_row = [_('Total')]
                    v = subtotals[i] if (subtotals and i < len(subtotals)) else None
                    total_row.append(str(round2(v, 2)) if v is not None else '')
                    table_data.append(total_row)
                    num_cols = len(col_headers)
                    data_table = table_cell.add_table(rows=len(table_data), cols=num_cols)
                    data_table.alignment = WD_TABLE_ALIGNMENT.CENTER
                    p_elem = table_cell.paragraphs[0]._element
                    p_elem.getparent().remove(p_elem)
                    for j in range(num_cols):
                        cell = data_table.cell(0, j)
                        cell.text = col_headers[j]
                        _style_table_cell(cell, is_header=True, bold=True, font_size=8)
                    for di in range(1, len(table_data) - 1):
                        for j in range(num_cols):
                            cell = data_table.cell(di, j)
                            cell.text = table_data[di][j]
                            _style_table_cell(cell, font_size=7)
                    last_row = len(table_data) - 1
                    for j in range(num_cols):
                        cell = data_table.cell(last_row, j)
                        cell.text = table_data[last_row][j]
                        _style_table_cell(cell, bold=True, font_size=7)
                    fig, ax_chart = plt.subplots(figsize=(8.5, 2.8))
                    page_len = end_row - start_row
                    page_data = []
                    for t_idx in range(start_row, end_row):
                        v = raw_data[t_idx] if t_idx < len(raw_data) else None
                        page_data.append(float(v) if v is not None else 0.0)
                    marker_step = max(1, page_len // 15)
                    ax_chart.plot(range(page_len), page_data, linewidth=1.2,
                                  color=color, marker='o', markersize=3,
                                  markevery=marker_step,
                                  label=names[i] + ' (' + unit_i + ')')
                    step = max(1, page_len // 8)
                    tick_positions = list(range(0, page_len, step))
                    tick_labels = []
                    for t in tick_positions:
                        if start_row + t < len(reporting_times):
                            tick_labels.append(reporting_times[start_row + t])
                    tick_positions = tick_positions[:len(tick_labels)]
                    ax_chart.set_xticks(tick_positions)
                    ax_chart.set_xticklabels(tick_labels, rotation=45, ha='right', fontsize=7)
                    ax_chart.set_title(_('Reporting Period Energy Item') + ' - ' + names[i] + ((' (' + unit_i + ')') if unit_i else ''),
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
                if i < num_items - 1:
                    doc.add_page_break()
        else:
            base_period_data = self.report['base_period']
            base_timestamps = base_period_data.get('timestamps', [[]])
            base_times = base_timestamps[0] if len(base_timestamps) > 0 else []
            base_values = base_period_data.get('values', [])
            base_subtotals = base_period_data.get('subtotals', [])
            first_item = True
            for i in range(num_items):
                color = self.chart_colors[i % len(self.chart_colors)]
                unit_i = units[i] if (units and i < len(units)) else ''
                r_data = values[i] if i < len(values) else []
                b_data = base_values[i] if i < len(base_values) else []
                total_rows = max(len(r_data), len(reporting_times), len(b_data), len(base_times))
                if total_rows == 0:
                    continue
                num_pages = (total_rows + rows_per_page - 1) // rows_per_page
                for page in range(num_pages):
                    start_row = page * rows_per_page
                    end_row = min(start_row + rows_per_page, total_rows)
                    if first_item and page == 0:
                        self._add_heading_styled(doc, self.name + ' ' + _('Detailed Data'), level=1)
                        first_item = False
                    container = doc.add_table(rows=2, cols=1)
                    container.alignment = WD_TABLE_ALIGNMENT.CENTER
                    _remove_table_borders(container)
                    table_cell = container.cell(0, 0)
                    chart_cell = container.cell(1, 0)
                    col_headers = [
                        _('Base Period') + ' - ' + _('Datetime'),
                        _('Base Period') + ' - ' + names[i] + ' (' + unit_i + ')',
                        _('Reporting Period') + ' - ' + _('Datetime'),
                        _('Reporting Period') + ' - ' + names[i] + ' (' + unit_i + ')'
                    ]
                    table_data = [col_headers]
                    for t_idx in range(start_row, end_row):
                        row_vals = [
                            base_times[t_idx] if t_idx < len(base_times) else '',
                            (str(round2(b_data[t_idx], 2)) if (t_idx < len(b_data) and b_data[t_idx] is not None) else ''),
                            reporting_times[t_idx] if t_idx < len(reporting_times) else '',
                            (str(round2(r_data[t_idx], 2)) if (t_idx < len(r_data) and r_data[t_idx] is not None) else '')
                        ]
                        table_data.append(row_vals)
                    total_row = [
                        _('Total'),
                        (str(round2(base_subtotals[i], 2)) if (base_subtotals and i < len(base_subtotals) and base_subtotals[i] is not None) else ''),
                        _('Total'),
                        (str(round2(subtotals[i], 2)) if (subtotals and i < len(subtotals) and subtotals[i] is not None) else '')
                    ]
                    table_data.append(total_row)
                    num_cols = len(col_headers)
                    data_table = table_cell.add_table(rows=len(table_data), cols=num_cols)
                    data_table.alignment = WD_TABLE_ALIGNMENT.CENTER
                    p_elem = table_cell.paragraphs[0]._element
                    p_elem.getparent().remove(p_elem)
                    for j in range(num_cols):
                        cell = data_table.cell(0, j)
                        cell.text = col_headers[j]
                        _style_table_cell(cell, is_header=True, bold=True, font_size=7)
                    for di in range(1, len(table_data) - 1):
                        for j in range(num_cols):
                            cell = data_table.cell(di, j)
                            cell.text = table_data[di][j]
                            _style_table_cell(cell, font_size=6)
                    last_row = len(table_data) - 1
                    for j in range(num_cols):
                        cell = data_table.cell(last_row, j)
                        cell.text = table_data[last_row][j]
                        _style_table_cell(cell, bold=True, font_size=6)
                    fig, ax_chart = plt.subplots(figsize=(8.5, 2.8))
                    page_len = end_row - start_row
                    page_r = []
                    for t_idx in range(start_row, end_row):
                        v = r_data[t_idx] if t_idx < len(r_data) else None
                        page_r.append(float(v) if v is not None else 0.0)
                    marker_step = max(1, page_len // 15)
                    ax_chart.plot(range(page_len), page_r, linewidth=1.2,
                                  color=color, marker='o', markersize=3,
                                  markevery=marker_step,
                                  label=_('Reporting Period') + ' - ' + names[i])
                    page_b = []
                    for t_idx in range(start_row, end_row):
                        v = b_data[t_idx] if t_idx < len(b_data) else None
                        page_b.append(float(v) if v is not None else 0.0)
                    ax_chart.plot(range(page_len), page_b, linewidth=1.2,
                                  color=color, linestyle='--',
                                  marker='s', markersize=3,
                                  markevery=marker_step,
                                  label=_('Base Period') + ' - ' + names[i])
                    step = max(1, page_len // 8)
                    tick_positions = list(range(0, page_len, step))
                    tick_labels = []
                    for t in tick_positions:
                        if start_row + t < len(reporting_times):
                            tick_labels.append(reporting_times[start_row + t])
                    tick_positions = tick_positions[:len(tick_labels)]
                    ax_chart.set_xticks(tick_positions)
                    ax_chart.set_xticklabels(tick_labels, rotation=45, ha='right', fontsize=7)
                    ax_chart.set_title(
                        _('Base Period') + ' / ' + _('Reporting Period') + ' - ' +
                        names[i] + ((' (' + unit_i + ')') if unit_i else ''),
                        fontsize=10, weight='bold')
                    ax_chart.legend(fontsize=6, loc='upper right')
                    ax_chart.grid(True, alpha=0.3)
                    chart_buf = self._fig_to_bytesio(fig, self.dpi)
                    p = chart_cell.paragraphs[0]
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    run = p.add_run()
                    run.add_picture(chart_buf, width=Inches(8.5))
                    if page < num_pages - 1:
                        doc.add_page_break()
                if i < num_items - 1:
                    doc.add_page_break()

        if has_next:
            doc.add_page_break()

    def _render_2x2_charts(self, doc, all_charts):
        charts_per_page = 4
        num_total = len(all_charts)
        for page_start in range(0, num_total, charts_per_page):
            page_end = min(page_start + charts_per_page, num_total)
            num_on = page_end - page_start
            rows = (num_on + 1) // 2
            for row_idx in range(rows):
                slot0 = row_idx * 2
                slot1 = slot0 + 1
                has_left = slot0 < num_on
                has_right = slot1 < num_on
                if has_left and not has_right:
                    container = doc.add_table(rows=1, cols=2)
                    container.alignment = WD_TABLE_ALIGNMENT.CENTER
                    _remove_table_borders(container)
                    container.cell(0, 0).merge(container.cell(0, 1))
                    cell = container.cell(0, 0)
                    p = cell.paragraphs[0]
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                    run = p.add_run()
                    run.add_picture(all_charts[page_start + slot0], width=Inches(4.8))
                else:
                    cols = min(2, num_on - row_idx * 2)
                    container = doc.add_table(rows=1, cols=cols)
                    container.alignment = WD_TABLE_ALIGNMENT.CENTER
                    _remove_table_borders(container)
                    for col_idx in range(cols):
                        slot = row_idx * 2 + col_idx
                        if slot >= num_on:
                            continue
                        cell = container.cell(0, col_idx)
                        p = cell.paragraphs[0]
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        run = p.add_run()
                        run.add_picture(all_charts[page_start + slot], width=Inches(4.8))
            if page_end < num_total:
                doc.add_page_break()

    def _add_parameters_section(self, doc):
        _ = self._
        params = self.report.get('parameters', {})
        if not params or not params.get('names') or not params.get('timestamps'):
            return

        param_names = params.get('names', [])
        timestamps = params.get('timestamps', [])
        values = params.get('values', [])
        units = params.get('units', [])

        all_zero = True
        for ts_list in timestamps:
            if ts_list and len(ts_list) > 0:
                all_zero = False
                break
        if all_zero:
            return

        valid_params = []
        for i in range(len(param_names)):
            if i < len(timestamps) and len(timestamps[i]) > 0:
                if i < len(values) and len(values[i]) > 0:
                    valid_params.append(i)
        if not valid_params:
            return

        self._add_heading_styled(doc, self.name + ' ' + _('Parameters'), level=1)

        rows_per_param = 10

        for pi in valid_params:
            name = param_names[pi]
            unit_i = units[pi] if (units and pi < len(units)) else ''
            times = timestamps[pi]
            data = values[pi]
            data_len = len(times)

            display_name = name + ((' (' + unit_i + ')') if unit_i else '')

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
            ax.set_title(display_name, fontsize=9, fontweight='bold')
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
    Export report data to DOCX and return base64 encoded string.
    This function maintains the same interface as the PDF exporter.
    """
    exporter = TenantEnergyItemDOCXExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
