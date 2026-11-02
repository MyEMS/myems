"""
Energy Flow Diagram DOCX Exporter

This module provides functionality to export energy flow diagram data to DOCX
format. It generates a report containing the Sankey energy flow visualization
together with the detailed links data.

Key Features:
- Energy flow diagram visualization (Sankey)
- Detailed links data table
- Multi-language support
- Base64 encoding for file transmission

The exported DOCX file includes:
- Cover page with logo and report metadata
- Energy flow Sankey chart image
- Links data table (source, target, value)
"""

import base64
import os
import time
import uuid

from decimal import Decimal
from typing import Optional, Dict, Any
import logging

import plotly.graph_objects as go

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


class EnergyFlowDiagramDOCXExporter:
    """
    Export energy flow diagram data to DOCX format.
    Generates a report with the Sankey chart image and the links data table.
    """

    def __init__(self, language: str = 'zh_CN'):
        self.language = language
        self.trans = get_translation(language)
        self._ = self.trans.gettext

    def export(self,
               report: Dict[str, Any],
               name: str,
               reporting_start_datetime_local: str,
               reporting_end_datetime_local: str,
               language: str) -> Optional[str]:
        if report is None:
            return None
        start_time = time.time()
        logger.info(f"Starting DOCX generation for {name}")

        docx_filename = self.generate_docx(report, name,
                                            reporting_start_datetime_local,
                                            reporting_end_datetime_local,
                                            language)

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

    def generate_docx(self,
                      report: Dict[str, Any],
                      name: str,
                      reporting_start_datetime_local: str,
                      reporting_end_datetime_local: str,
                      language: str) -> Optional[str]:
        filename = str(uuid.uuid4()) + '.docx'

        self.report = report
        self.name = name

        doc = Document()
        section = doc.sections[0]
        section.orientation = 0
        section.page_width = Inches(8.27)
        section.page_height = Inches(11.69)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)

        self._add_cover_page(doc, name,
                             reporting_start_datetime_local,
                             reporting_end_datetime_local)

        configure_cover_section(doc.sections[0])

        if report.get('nodes') and report.get('links'):
            self._add_links_section(doc)

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

    def _add_cover_page(self, doc, name, reporting_start, reporting_end):
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
        run = title.add_run(_('Auxiliary System') + ' - ' + _('Energy Flow Diagram'))
        run.font.size = Pt(24)
        run.font.bold = True
        run.font.name = 'Arial'
        r = run._element
        r.rPr.rFonts.set(qn('w:eastAsia'), 'SimSun')

        for _unused in range(2):
            doc.add_paragraph('')

        info_data = [
            [_('Name') + ':', name],
            [_('Reporting Start Datetime') + ':', reporting_start],
            [_('Reporting End Datetime') + ':', reporting_end],
        ]

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

    @staticmethod
    def _build_sankey(report, name):
        nodes = list()
        source = list()
        target = list()
        values = list()
        node_value = list()
        color = ['rgba(25,202,173, 0.8)', 'rgba(140,199,181, 0.8)', 'rgba(160,238,225, 0.8)',
                 'rgba(190,231,233, 0.8)', 'rgba(190,237,199,0.8)', 'rgba(109,91,7,0.8)',
                 'rgba(27,167,4,0.8)', 'rgba(108,234,12,0.8)', 'rgba(202,217,14,0.8)',
                 'rgba(70,6,12,0.8)', 'rgba(246,10,15,0.8)', 'rgba(240,5,15,0.8)']
        node_color_list = list()
        for key, node in enumerate(report['nodes']):
            nodes.append(node['name'])
            node_value.append(Decimal(0.0))
            node_color_list.append(color[key % len(color)])
        for link in report['links']:
            source.append(nodes.index(link['source']))
            target.append(nodes.index(link['target']))
            link_value = Decimal(link['value']) if link['value'] is not None else Decimal(0.0)
            values.append(float(link_value))
            node_value[nodes.index(link['source'])] = \
                node_value[nodes.index(link['source'])] - link_value
            node_value[nodes.index(link['target'])] = \
                node_value[nodes.index(link['target'])] + link_value
        labels = [value + ':' + str(node_value[key].copy_abs())
                  for key, value in enumerate(nodes)]

        fig = go.Figure(data=[go.Sankey(
            valueformat=".0f",
            valuesuffix="TWh",
            node=dict(pad=15, thickness=15, line=dict(color="black", width=0.5),
                      label=labels, color=node_color_list),
            link=dict(source=source, target=target, value=values)
        )])
        fig.update_layout(title_text=name, font_size=10)
        return fig

    def _add_links_section(self, doc):
        _ = self._
        report = self.report

        body_section = doc.add_section(WD_SECTION.NEW_PAGE)
        body_section.orientation = 0
        body_section.page_width = Inches(8.27)
        body_section.page_height = Inches(11.69)
        body_section.left_margin = Inches(0.5)
        body_section.right_margin = Inches(0.5)
        body_section.top_margin = Inches(0.5)
        body_section.bottom_margin = Inches(0.5)
        header_title = _('Auxiliary System') + ' - ' + _('Energy Flow Diagram') + \
            '  |  ' + self.name
        configure_body_section(body_section, header_title=header_title)

        self._add_heading_styled(doc, self.name + ' - ' + _('Energy Flow Diagram'), level=1)

        # Sankey chart image
        sankey_filename = str(uuid.uuid4()) + '.png'
        try:
            fig = self._build_sankey(report, self.name)
            fig.write_image(sankey_filename)
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            run = p.add_run()
            run.add_picture(sankey_filename, width=Inches(7.0))
        except Exception as e:
            logger.warning(f"Failed to generate Sankey chart: {e}")
        finally:
            try:
                os.remove(sankey_filename)
            except Exception:
                pass

        # Links data table
        col_headers = [_('Source'), _('Target'), _('Value')]
        num_cols = len(col_headers)

        table_data = [col_headers]
        for link in report['links']:
            table_data.append([link['source'],
                               link['target'],
                               str(round2(link['value'], 2))])

        data_table = doc.add_table(rows=len(table_data), cols=num_cols)
        data_table.alignment = WD_TABLE_ALIGNMENT.CENTER

        for j in range(num_cols):
            cell = data_table.cell(0, j)
            cell.text = col_headers[j]
            _style_table_cell(cell, is_header=True, bold=True, font_size=8)

        for i in range(1, len(table_data)):
            for j in range(num_cols):
                cell = data_table.cell(i, j)
                cell.text = table_data[i][j]
                _style_table_cell(cell, font_size=7)


def export(report,
           name,
           reporting_start_datetime_local,
           reporting_end_datetime_local,
           language):
    """
    Export energy flow diagram data to DOCX and return base64 encoded string.
    This function maintains the same interface as the Excel exporter.
    """
    exporter = EnergyFlowDiagramDOCXExporter(language)
    return exporter.export(report, name,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           language)
