"""
Equipment Batch PDF Exporter

This module provides functionality to export equipment batch data to PDF format.
It generates comprehensive reports showing energy consumption data for multiple equipment
within a specific space and time period.

Key Features:
- Multi-equipment energy consumption comparison table
- Energy category breakdown with units
- Carbon emissions and cost summary
- Bar chart visualization for equipment comparison
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Cover page with report metadata
- Batch data table (equipment names, spaces, energy values, carbon, cost)
- Bar chart pages for visual comparison by energy category
"""

import base64
import os
import time
import uuid

from decimal import Decimal
from typing import Optional, Dict, List, Any
import logging

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from matplotlib.backends.backend_pdf import PdfPages

from core.utilities import get_translation, round2

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Module-level font setup cache
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
    logger.warning("Failed to load bundled NotoSansCJK font, using DejaVu Sans")
    return False


def _convert_decimals(obj):
    """Recursively convert Decimal values to float in nested data structures."""
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: _convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_convert_decimals(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(_convert_decimals(item) for item in obj)
    return obj


def _style_table_borders(table, num_rows, num_cols):
    """Add borders to all cells in a table."""
    for i in range(num_rows):
        for j in range(num_cols):
            table[i, j].set_edgecolor('#333333')
            table[i, j].set_linewidth(0.5)


class EquipmentBatchPDFExporter:
    """
    Export equipment batch data to PDF format.
    Generates comprehensive reports with tables and charts for multi-equipment comparison.
    """

    def __init__(self, language: str = 'zh_CN'):
        font_setup_success = setup_chinese_fonts()
        if not font_setup_success:
            logger.warning("Chinese font setup failed, some text may not display correctly")

        self.language = language
        self.trans = get_translation(language)
        self._ = self.trans.gettext

        # Page settings - A4 landscape
        self.page_size = (11.69, 8.27)
        self.dpi = 80

        # Color scheme
        self.colors = {
            'table_header': '#4472C4',
            'table_green': '#90EE90',
            'table_alternate': '#E8EDF5',
            'chart_colors': ['#4472C4', '#ED7D31', '#70AD47', '#FFC000', '#5B9BD5',
                             '#FF6B6B', '#9B59B6', '#1ABC9C', '#E67E22', '#2ECC71',
                             '#3498DB', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6']
        }

    def export(self,
               report: Dict[str, Any],
               space_name: str,
               reporting_start_datetime_local: str,
               reporting_end_datetime_local: str,
               language: str) -> Optional[str]:
        """Export report data to PDF and return base64 encoded string."""
        if report is None:
            return None
        start_time = time.time()
        logger.info(f"Starting PDF generation for equipment batch")

        pdf_filename = self.generate_pdf(
            report, space_name,
            reporting_start_datetime_local,
            reporting_end_datetime_local,
            language
        )

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
        logger.info(f"PDF generation completed in {elapsed:.2f}s")
        return result

    def generate_pdf(self,
                     report: Dict[str, Any],
                     space_name: str,
                     reporting_start_datetime_local: str,
                     reporting_end_datetime_local: str,
                     language: str) -> Optional[str]:
        """Generate PDF file from report data."""
        _ = self._

        filename = str(uuid.uuid4()) + '.pdf'

        self.report = _convert_decimals(report)
        self.space_name = space_name
        self.reporting_start = reporting_start_datetime_local
        self.reporting_end = reporting_end_datetime_local

        with PdfPages(filename) as pdf:
            # Cover page
            self._create_cover_page(pdf)

            # Batch data table
            self._create_batch_data_table(pdf)

        logger.info(f"PDF generated: {filename}")
        return filename

    def _create_cover_page(self, pdf: PdfPages):
        """Create cover page with logo, centered title, and borderless info list."""
        _ = self._
        fig = plt.figure(figsize=self.page_size)

        # Logo
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

        # Title - _('Batch Analysis') translates to "批量分析" in zh_CN
        fig.text(0.5, 0.50, _('Equipment Data') + ' - ' +_('Batch Analysis'),
                 fontsize=24, weight='bold', ha='center', va='center')

        # Info list
        info_data = [
            [_('Space') + ':', self.space_name],
            [_('Reporting Start Datetime') + ':', self.reporting_start],
            [_('Reporting End Datetime') + ':', self.reporting_end],
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

    def _create_batch_data_table(self, pdf: PdfPages):
        """Create the main batch data table showing all equipment with energy values,
        carbon emissions, and costs. Paginates if too many equipment rows.
        """
        _ = self._
        equipments = self.report.get('equipments', [])
        energy_categories = self.report.get('energycategories', [])

        if not equipments:
            return

        ca_len = len(energy_categories)
        # Column headers: Name, Space, EC1(unit), EC2(unit), ..., Carbon(KGCO2E), Cost(CNY)
        col_headers = [_('Name'), _('Space')]
        for ec in energy_categories:
            col_headers.append(ec['name'] + ' (' + ec['unit_of_measure'] + ')')
        col_headers.append(_('Carbon Emissions') + ' (KGCO2E)')
        col_headers.append(_('Costs') + ' (CNY)')

        total_cols = len(col_headers)
        num_equipment = len(equipments)

        # Paginate: max rows per page
        max_rows_per_page = 25
        num_pages = (num_equipment + max_rows_per_page - 1) // max_rows_per_page

        for page in range(num_pages):
            start_idx = page * max_rows_per_page
            end_idx = min(start_idx + max_rows_per_page, num_equipment)
            page_equipments = equipments[start_idx:end_idx]

            fig = plt.figure(figsize=self.page_size)
            if num_pages == 1:
                fig.suptitle(self.space_name + ' - ' + _('Batch Analysis'),
                             fontsize=16, weight='bold', y=0.98)
            else:
                fig.suptitle(self.space_name + ' - ' + _('Batch Analysis') +
                             ' (' + str(page + 1) + '/' + str(num_pages) + ')',
                             fontsize=16, weight='bold', y=0.98)

            # Build table data
            table_data = [col_headers]
            for eq in page_equipments:
                row = [eq['equipment_name'], eq['space_name']]
                for j in range(ca_len):
                    val = eq['values'][j] if j < len(eq['values']) else 0
                    row.append(str(round2(val, 2)))
                row.append(str(round2(eq.get('carbon_emissions', 0.0), 2)))
                row.append(str(round2(eq.get('cost', 0.0), 2)))
                table_data.append(row)

            ax = fig.add_axes([0.02, 0.05, 0.96, 0.88])
            ax.axis('off')

            # Column widths: Name=0.15, Space=0.15, energy cols share remaining, carbon=0.08, cost=0.08
            fixed_w = 0.15 + 0.15 + 0.08 + 0.08  # Name + Space + Carbon + Cost
            remaining_w = 1.0 - fixed_w
            ec_col_w = remaining_w / ca_len if ca_len > 0 else 0.1
            col_widths = [0.15, 0.15] + [ec_col_w] * ca_len + [0.08, 0.08]
            # Normalize
            total_w = sum(col_widths)
            col_widths = [w / total_w for w in col_widths]

            tbl = ax.table(cellText=table_data, loc='center',
                           cellLoc='center', colWidths=col_widths)
            tbl.auto_set_font_size(False)

            # Font size based on number of columns
            font_size = max(4, min(8, 80 // total_cols))
            tbl.set_fontsize(font_size)

            # Header row styling
            for j in range(total_cols):
                tbl[0, j].set_facecolor('#90EE90')
                tbl[0, j].set_text_props(weight='bold')

            # First column (Name) styling
            for i in range(1, len(table_data)):
                tbl[i, 0].set_facecolor('#90EE90')
                tbl[i, 0].set_text_props(weight='bold')

            # Alternate row colors
            for i in range(2, len(table_data), 2):
                for j in range(total_cols):
                    tbl[i, j].set_facecolor('#E8EDF5')

            _style_table_borders(tbl, len(table_data), total_cols)

            pdf.savefig(fig)
            plt.close()


# Convenience function for backward compatibility
def export(report, space_name, reporting_start_datetime_local,
           reporting_end_datetime_local, language):
    """
    Export report data to PDF and return base64 encoded string.
    This function maintains the same interface as the Excel exporter.
    """
    exporter = EquipmentBatchPDFExporter(language)
    return exporter.export(report, space_name,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           language)
