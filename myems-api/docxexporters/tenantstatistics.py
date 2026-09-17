"""
Tenant Statistics DOCX Exporter

This module provides functionality to export tenant statistics data to DOCX format.
It generates comprehensive reports showing statistical analysis for tenants
with detailed breakdown by energy categories and base vs reporting comparison.

Key Features:
- Tenant statistics analysis (mean/median/min/max/std/variance)
- Base period vs reporting period side-by-side comparison tables
- Per unit area statistics
- Increment rates
- Multi-language support
- Base64 encoding for file transmission

The exported DOCX file includes:
- Cover page with logo and report metadata (Tenant Data - Statistics)
- Statistics summary (2 tables: 6 statistics + increment rates; per unit area stats)
- Detailed data charts + Base/Reporting comparison table (spacecarbon dual column)
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


class TenantStatisticsDOCXExporter:
    """
    Export tenant statistics data to DOCX format.
    Matches PDF layout with stats tables + detailed comparison + parameters.
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
                                 False)
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
                             self.is_base_period_exists)

        self._add_statistics_tables(doc)
        self._add_detailed_data_section(doc)
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
                logger.warning("Failed to load logo image: %s", e)

        for _unused in range(3):
            doc.add_paragraph('')

        title = doc.add_paragraph()
        title.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = title.add_run(_('Tenant Data') + ' - ' + _('Statistics'))
        run.font.size = Pt(24)
        run.font.bold = True
        run.font.name = 'Arial'
        r = run._element
        r.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')

        for _unused in range(3):
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

        doc.add_page_break()

    def _add_statistics_tables(self, doc):
        """Add two tables: core statistics + increment rates (12 rows + per unit area
        statistics with the same structure)."""
        _ = self._

        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        ca_len = len(names)
        if ca_len == 0:
            return

        self._add_heading_styled(doc, self.name + ' - ' + _('Statistics'),
                                 level=1)

        means = reporting_data.get('means', [])
        medians = reporting_data.get('medians', [])
        minimums = reporting_data.get('minimums', [])
        maximums = reporting_data.get('maximums', [])
        stdevs = reporting_data.get('stdevs', [])
        variances = reporting_data.get('variances', [])
        means_ir = reporting_data.get('means_increment_rates', [])
        medians_ir = reporting_data.get('medians_increment_rates', [])
        minimums_ir = reporting_data.get('minimums_increment_rates', [])
        maximums_ir = reporting_data.get('maximums_increment_rates', [])
        stdevs_ir = reporting_data.get('stdevs_increment_rates', [])
        variances_ir = reporting_data.get('variances_increment_rates', [])

        num_cols = ca_len + 1
        table_rows = 13

        stats_table_title = doc.add_paragraph()
        stats_table_title_run = stats_table_title.add_run(self.name + ' ' + _('Statistics'))
        stats_table_title_run.font.bold = True
        stats_table_title_run.font.name = 'Arial'
        stats_table_title_run.font.size = Pt(12)
        r = stats_table_title_run._element
        r.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')

        stats_table = doc.add_table(rows=table_rows, cols=num_cols)
        stats_table.alignment = WD_TABLE_ALIGNMENT.CENTER

        h0 = stats_table.cell(0, 0)
        h0.text = ''
        _style_table_cell(h0, is_header=True, bold=True, font_size=8)
        for j in range(ca_len):
            unit_i = units[j] if (units and j < len(units)) else ''
            c_h = stats_table.cell(0, j + 1)
            c_h.text = names[j] + ' (' + unit_i + ')'
            _style_table_cell(c_h, is_header=True, bold=True, font_size=8)

        stat_field_list = [
            (1, _('Arithmetic Mean'), means),
            (2, _('Arithmetic Mean') + ' - ' + _('Increment Rate'), means_ir, True),
            (3, _('Median (Middle Value)'), medians),
            (4, _('Median (Middle Value)') + ' - ' + _('Increment Rate'), medians_ir, True),
            (5, _('Minimum Value'), minimums),
            (6, _('Minimum Value') + ' - ' + _('Increment Rate'), minimums_ir, True),
            (7, _('Maximum Value'), maximums),
            (8, _('Maximum Value') + ' - ' + _('Increment Rate'), maximums_ir, True),
            (9, _('Sample Standard Deviation'), stdevs),
            (10, _('Sample Standard Deviation') + ' - ' + _('Increment Rate'), stdevs_ir, True),
            (11, _('Sample Variance'), variances),
            (12, _('Sample Variance') + ' - ' + _('Increment Rate'), variances_ir, True),
        ]

        for item in stat_field_list:
            if len(item) == 3:
                row_num, label, values_list = item
                is_percent = False
            else:
                row_num, label, values_list, is_percent = item
            if row_num >= table_rows:
                continue
            c_row = stats_table.cell(row_num, 0)
            c_row.text = label
            _style_table_cell(c_row, is_green=True, bold=True, font_size=8)
            for j in range(ca_len):
                val = values_list[j] if (values_list and j < len(values_list)) else None
                if is_percent:
                    pct_val = (val * 100.0) if val is not None else 0.0
                    text_v = '{:.2f}%'.format(pct_val)
                else:
                    text_v = '' if val is None else str(round2(val, 2))
                c_val = stats_table.cell(row_num, j + 1)
                c_val.text = text_v
                _style_table_cell(c_val, font_size=8)

        doc.add_paragraph('')

        # Per unit area statistics table
        means_pua = reporting_data.get('means_per_unit_area', [])
        medians_pua = reporting_data.get('medians_per_unit_area', [])
        minimums_pua = reporting_data.get('minimums_per_unit_area', [])
        maximums_pua = reporting_data.get('maximums_per_unit_area', [])
        stdevs_pua = reporting_data.get('stdevs_per_unit_area', [])
        variances_pua = reporting_data.get('variances_per_unit_area', [])

        pua_table_title = doc.add_paragraph()
        pua_title_text = self.name + ' ' + _('Per Unit Area')
        area = self.report.get('tenant', {}).get('area', None)
        if area is not None:
            pua_title_text += '    ' + str(area) + 'M\u00b2'
        pua_table_title_run = pua_table_title.add_run(pua_title_text)
        pua_table_title_run.font.bold = True
        pua_table_title_run.font.name = 'Arial'
        pua_table_title_run.font.size = Pt(12)
        r = pua_table_title_run._element
        r.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')

        pua_table = doc.add_table(rows=7, cols=num_cols)
        pua_table.alignment = WD_TABLE_ALIGNMENT.CENTER

        hp0 = pua_table.cell(0, 0)
        hp0.text = ''
        _style_table_cell(hp0, is_header=True, bold=True, font_size=8)
        for j in range(ca_len):
            unit_i = units[j] if (units and j < len(units)) else ''
            c_h = pua_table.cell(0, j + 1)
            if unit_i:
                c_h.text = names[j] + ' (' + unit_i + '/M\u00b2)'
            else:
                c_h.text = names[j] + ' (/M\u00b2)'
            _style_table_cell(c_h, is_header=True, bold=True, font_size=8)

        pua_field_list = [
            (1, _('Arithmetic Mean'), means_pua),
            (2, _('Median (Middle Value)'), medians_pua),
            (3, _('Minimum Value'), minimums_pua),
            (4, _('Maximum Value'), maximums_pua),
            (5, _('Sample Standard Deviation'), stdevs_pua),
            (6, _('Sample Variance'), variances_pua),
        ]
        for row_num, label, values_list in pua_field_list:
            c_row = pua_table.cell(row_num, 0)
            c_row.text = label
            _style_table_cell(c_row, is_green=True, bold=True, font_size=8)
            for j in range(ca_len):
                val = values_list[j] if (values_list and j < len(values_list)) else None
                text_v = str(round2(val, 2)) if val is not None else ''
                c_val = pua_table.cell(row_num, j + 1)
                c_val.text = text_v
                _style_table_cell(c_val, font_size=8)

        doc.add_page_break()

    def _add_detailed_data_section(self, doc):
        """Add charts section, up to 4 charts per page in 2x2 grid (PDF-style)."""
        _ = self._
        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        values = reporting_data.get('values', [])
        timestamps = reporting_data.get('timestamps', [])
        ca_len = len(names)
        if ca_len == 0 or not timestamps or len(timestamps[0]) == 0:
            return

        reporting_times = timestamps[0]
        charts_per_page = 4

        self._add_heading_styled(doc, self.name + ' ' + _('Detailed Data'), level=1)

        if not self.is_base_period_exists:
            all_charts = []
            for i in range(ca_len):
                raw_data = values[i] if i < len(values) else []
                xs, ys = self._filter_valid_data(raw_data)
                color = self.chart_colors[i % len(self.chart_colors)]
                fig, ax = plt.subplots(figsize=(4.8, 3.0))
                if ys:
                    ax.plot(xs, ys, linewidth=1.2, color=color,
                            marker='o', markersize=3,
                            markevery=max(1, len(ys) // 30))
                step = max(1, len(raw_data) // 10)
                ax.set_xticks(range(0, len(raw_data), step))
                ax.set_xticklabels(
                    [reporting_times[t][:10] for t in range(0, len(raw_data), step)],
                    rotation=45, ha='right', fontsize=7)
                unit_i = units[i] if (units and i < len(units)) else ''
                ax.set_title(_('Reporting Period Consumption') + ' - ' +
                             names[i] + ' (' + unit_i + ')',
                             fontsize=9, fontweight='bold')
                ax.grid(True, alpha=0.3)
                all_charts.append(self._fig_to_bytesio(fig, self.dpi))
            self._render_2x2_chart_page(doc, all_charts)
        else:
            base_period_data = self.report['base_period']
            base_values = base_period_data.get('values', [])
            all_charts = []
            for i in range(ca_len):
                color = self.chart_colors[i % len(self.chart_colors)]
                fig, ax = plt.subplots(figsize=(4.8, 3.0))
                r_data = values[i] if i < len(values) else []
                r_xs, r_ys = self._filter_valid_data(r_data)
                if r_ys:
                    ax.plot(r_xs, r_ys, linewidth=1.2, color=color,
                            marker='o', markersize=3,
                            markevery=max(1, len(r_ys) // 30),
                            label=_('Reporting Period') + ' - ' + names[i])
                if i < len(base_values):
                    b_data = base_values[i]
                    b_xs, b_ys = self._filter_valid_data(b_data)
                    if b_ys:
                        ax.plot(b_xs, b_ys, linewidth=1.2, color=color,
                                linestyle='--', marker='s', markersize=3,
                                markevery=max(1, len(b_ys) // 30),
                                label=_('Base Period') + ' - ' + names[i])
                step = max(1, len(r_data) // 10)
                ax.set_xticks(range(0, len(r_data), step))
                ax.set_xticklabels(
                    [reporting_times[t][:10] if t < len(reporting_times) else ''
                     for t in range(0, len(r_data), step)],
                    rotation=45, ha='right', fontsize=7)
                unit_i = units[i] if (units and i < len(units)) else ''
                ax.set_title(
                    _('Base Period') + ' / ' + _('Reporting Period') + ' - ' +
                    names[i] + ' (' + unit_i + ')',
                    fontsize=8, fontweight='bold')
                if r_ys or (i < len(base_values) and b_ys):
                    ax.legend(fontsize=7)
                ax.grid(True, alpha=0.3)
                all_charts.append(self._fig_to_bytesio(fig, self.dpi))
            self._render_2x2_chart_page(doc, all_charts)

        doc.add_page_break()

    def _render_2x2_chart_page(self, doc, all_charts):
        charts_per_page = 4
        num_total = len(all_charts)
        for page_start in range(0, num_total, charts_per_page):
            page_end = min(page_start + charts_per_page, num_total)
            num_on_page = page_end - page_start
            rows = (num_on_page + 1) // 2
            for row_idx in range(rows):
                slot0 = row_idx * 2
                slot1 = slot0 + 1
                has_left = slot0 < num_on_page
                has_right = slot1 < num_on_page
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
                    cols = min(2, num_on_page - row_idx * 2)
                    container = doc.add_table(rows=1, cols=cols)
                    container.alignment = WD_TABLE_ALIGNMENT.CENTER
                    _remove_table_borders(container)
                    for col_idx in range(cols):
                        slot = row_idx * 2 + col_idx
                        if slot >= num_on_page:
                            continue
                        cell = container.cell(0, col_idx)
                        p = cell.paragraphs[0]
                        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                        run = p.add_run()
                        run.add_picture(all_charts[page_start + slot], width=Inches(4.8))
            if page_end < num_total:
                doc.add_page_break()

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
    exporter = TenantStatisticsDOCXExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
