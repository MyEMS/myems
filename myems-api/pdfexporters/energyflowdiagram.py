"""
Energy Flow Diagram PDF Exporter

This module provides functionality to export energy flow diagram data to PDF
format. It generates a report containing the Sankey energy flow visualization
together with the detailed links data.

Key Features:
- Energy flow diagram visualization (Sankey)
- Detailed links data table
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
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

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend to avoid GUI thread warnings
import matplotlib.pyplot as plt

from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.lines import Line2D

import plotly.graph_objects as go

from core.utilities import get_translation, round2

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Module-level font setup cache - load TTC font only once
_font_setup_done = False


def setup_chinese_fonts():
    """
    Setup Chinese font support for matplotlib.
    Loads the bundled NotoSansCJK font from pdfexporters/fonts/.
    Result is cached at module level to avoid repeated expensive TTC parsing.
    """
    global _font_setup_done
    if _font_setup_done:
        return True

    font_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             'fonts', 'NotoSansCJK-Regular.ttc')
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
    logger.warning("Failed to load bundled NotoSansCJK font, using DejaVu Sans "
                   "(Chinese may not display correctly)")
    return False


def _style_table_borders(table, num_rows, num_cols):
    """Add borders to all cells in a table."""
    for i in range(num_rows):
        for j in range(num_cols):
            table[i, j].set_edgecolor('#333333')
            table[i, j].set_linewidth(0.5)


class EnergyFlowDiagramPDFExporter:
    """
    Export energy flow diagram data to PDF format.
    Generates a report with the Sankey chart image and the links data table.
    """

    def __init__(self, language: str = 'zh_CN'):
        font_setup_success = setup_chinese_fonts()
        if not font_setup_success:
            logger.warning("Chinese font setup failed, some text may not display correctly")

        self.language = language
        self.trans = get_translation(language)
        # Do NOT call self.trans.install() - it modifies global builtins._
        # Use instance-level gettext via self._ instead.
        self._ = self.trans.gettext

        # Page settings
        self.page_size = (8.27, 11.69)  # A4 portrait
        self.dpi = 80

        # Color scheme (matching Excel style)
        self.colors = {
            'primary': '#4472C4',
            'table_header': '#90EE90',
            'table_total': '#E8EDF5',
        }

    def export(self,
               report: Dict[str, Any],
               name: str,
               reporting_start_datetime_local: str,
               reporting_end_datetime_local: str,
               language: str) -> Optional[str]:
        """
        Export report data to PDF and return base64 encoded string.
        """
        if report is None:
            return None

        start_time = time.time()
        logger.info(f"Starting PDF generation for {name}")
        pdf_filename = self.generate_pdf(report, name,
                                         reporting_start_datetime_local,
                                         reporting_end_datetime_local,
                                         language)

        result = ''
        if pdf_filename and os.path.exists(pdf_filename):
            try:
                with open(pdf_filename, 'rb') as binary_file:
                    binary_data = binary_file.read()
                result = base64.b64encode(binary_data).decode('utf-8')
            except Exception as e:
                logger.error(f"Failed to encode PDF: {str(e)}")
            finally:
                try:
                    os.remove(pdf_filename)
                except Exception:
                    pass
        elapsed = time.time() - start_time
        logger.info(f"PDF generation completed in {elapsed:.2f}s for {name}")
        return result

    def generate_pdf(self,
                     report: Dict[str, Any],
                     name: str,
                     reporting_start_datetime_local: str,
                     reporting_end_datetime_local: str,
                     language: str) -> Optional[str]:
        """
        Generate PDF file from report data.
        """
        filename = str(uuid.uuid4()) + '.pdf'

        self.report = report
        self.name = name

        _ = self._
        self.header_title = (f"{_('Auxiliary System')} - {_('Energy Flow Diagram')}"
                             f"  |  {self.name}")
        # Body page counter; cover page is not counted, body starts at 1
        self.current_page_number = 0

        with PdfPages(filename) as pdf:
            # Cover page (always generated, matches the Excel header block)
            self._create_cover_page(pdf, name,
                                    reporting_start_datetime_local,
                                    reporting_end_datetime_local)

            if report.get('nodes') and report.get('links'):
                self._create_flow_pages(pdf)

        logger.info(f"PDF generated: {filename}")
        return filename

    def _draw_header_footer(self, fig):
        """Draw the standard MyEMS header (centered title + grey separator) and
        footer (centered current page number) on a body page figure.
        The cover page must NOT call this method.
        """
        fig.text(0.5, 0.97, self.header_title,
                 fontsize=9, ha='center', va='center')
        sep = Line2D([0.05, 0.95], [0.955, 0.955],
                     transform=fig.transFigure, color='#999999', lw=0.8)
        fig.add_artist(sep)
        fig.text(0.5, 0.02, str(self.current_page_number),
                 fontsize=9, ha='center', va='center')

    def _save_body_page(self, pdf, fig):
        """Unified exit for every non-cover page: bump the page counter, draw
        header/footer, then save and close the figure.
        """
        self.current_page_number += 1
        self._draw_header_footer(fig)
        pdf.savefig(fig)
        plt.close(fig)

    def _create_cover_page(self, pdf: PdfPages, name: str,
                           reporting_start: str, reporting_end: str):
        """Create cover page with logo, centered title, and borderless info list."""
        _ = self._
        fig = plt.figure(figsize=self.page_size)

        # ===== Logo image: centered above title =====
        img_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                '..', 'excelexporters', 'myems.png')
        if os.path.exists(img_path):
            try:
                img = plt.imread(img_path)
                img_w_inch = img.shape[1] / self.dpi
                img_h_inch = img.shape[0] / self.dpi
                page_w, page_h = self.page_size
                ax_img = fig.add_axes([0.5 - img_w_inch / page_w / 2,
                                       0.62,
                                       img_w_inch / page_w,
                                       img_h_inch / page_h])
                ax_img.imshow(img)
                ax_img.axis('off')
            except Exception as e:
                logger.warning(f"Failed to load logo image: {e}")

        # ===== Title: large bold text centered on page =====
        fig.text(0.5, 0.50, _('Auxiliary System') + ' - ' + _('Energy Flow Diagram'),
                 fontsize=24, weight='bold', ha='center', va='center')

        # ===== Info list: no table borders, centered below title =====
        info_data = [
            [_('Name') + ':', name],
            [_('Reporting Start Datetime') + ':', reporting_start],
            [_('Reporting End Datetime') + ':', reporting_end],
        ]

        ax_table = fig.add_axes([0.25, 0.10, 0.50, 0.35])
        ax_table.axis('off')

        table = ax_table.table(cellText=info_data, loc='center',
                               cellLoc='center', colWidths=[0.35, 0.65])
        table.auto_set_font_size(False)
        table.set_fontsize(12)

        for i in range(len(info_data)):
            for j in [0, 1]:
                table[i, j].set_edgecolor('white')
                table[i, j].set_linewidth(0)
            table[i, 0].set_text_props(ha='right')
            table[i, 1].get_text().set_ha('center')

        pdf.savefig(fig)
        plt.close()

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

    def _create_flow_pages(self, pdf: PdfPages):
        """Create body pages: the Sankey chart plus the links data table."""
        _ = self._

        links = self.report['links']

        # Sankey chart image (rendered by plotly/kaleido to a temp PNG file)
        sankey_img = None
        sankey_filename = str(uuid.uuid4()) + '.png'
        try:
            fig = self._build_sankey(self.report, self.name)
            fig.write_image(sankey_filename)
            sankey_img = plt.imread(sankey_filename)
        except Exception as e:
            logger.warning(f"Failed to generate Sankey chart: {e}")
        finally:
            try:
                os.remove(sankey_filename)
            except Exception:
                pass

        col_headers = [_('Source'), _('Target'), _('Value')]
        num_cols = len(col_headers)

        # The first page reserves the upper half for the Sankey chart, so it
        # holds fewer data rows; the remaining rows flow over to later pages.
        first_page_rows = 15
        other_page_rows = 35

        pages = []
        if len(links) > 0:
            pages.append(links[:first_page_rows])
            idx = first_page_rows
            while idx < len(links):
                pages.append(links[idx:idx + other_page_rows])
                idx += other_page_rows

        for page_index, page_links in enumerate(pages):
            fig = plt.figure(figsize=self.page_size)
            fig.suptitle(self.name + ' ' + _('Energy Flow Diagram'),
                         fontsize=16, weight='bold', y=0.94)

            if page_index == 0 and sankey_img is not None:
                ax_img = fig.add_axes([0.08, 0.52, 0.84, 0.36])
                ax_img.imshow(sankey_img)
                ax_img.axis('off')
                ax_table = fig.add_axes([0.08, 0.08, 0.84, 0.40])
            else:
                ax_table = fig.add_axes([0.08, 0.08, 0.84, 0.80])
            ax_table.axis('off')

            table_data = [col_headers]
            for link in page_links:
                table_data.append([link['source'],
                                   link['target'],
                                   str(round2(link['value'], 2))])

            table = ax_table.table(cellText=table_data, loc='upper center',
                                   cellLoc='center', colWidths=[0.4, 0.4, 0.2],
                                   bbox=[0, 0, 1, 1])
            table.auto_set_font_size(False)
            table.set_fontsize(7)

            for j in range(num_cols):
                table[0, j].set_facecolor(self.colors['table_header'])
                table[0, j].set_text_props(weight='bold')
            _style_table_borders(table, len(table_data), num_cols)

            self._save_body_page(pdf, fig)


# Convenience function keeping the same interface as the Excel exporter
def export(report, name, reporting_start_datetime_local, reporting_end_datetime_local,
           language):
    """
    Export energy flow diagram data to PDF and return base64 encoded string.
    This function maintains the same interface as the Excel exporter.
    """
    exporter = EnergyFlowDiagramPDFExporter(language)
    return exporter.export(report, name,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           language)
