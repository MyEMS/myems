"""
Equipment Comparison PDF Exporter

This module provides functionality to export equipment comparison data to PDF format.
It generates comprehensive reports comparing energy consumption between two equipment
with detailed breakdown by time periods.

Key Features:
- Two-equipment energy consumption comparison
- Consumption summary table
- Detailed data table with timestamps, values, and difference
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Cover page with report metadata
- Consumption summary table (equipment1, equipment2, difference)
- Detailed data table (paginated, matching Excel content)
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


class EquipmentComparisonPDFExporter:
    """
    Export equipment comparison data to PDF format.
    Generates comprehensive reports comparing two equipment energy consumption.
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

    def export(self,
               report: Dict[str, Any],
               equipment1_name: str,
               equipment2_name: str,
               energy_category_name: str,
               reporting_start_datetime_local: str,
               reporting_end_datetime_local: str,
               period_type: str,
               language: str) -> Optional[str]:
        """Export report data to PDF and return base64 encoded string."""
        if report is None:
            return None
        start_time = time.time()
        logger.info(f"Starting PDF generation for equipment comparison")

        pdf_filename = self.generate_pdf(
            report, equipment1_name, equipment2_name, energy_category_name,
            reporting_start_datetime_local, reporting_end_datetime_local,
            period_type, language
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
                     equipment1_name: str,
                     equipment2_name: str,
                     energy_category_name: str,
                     reporting_start_datetime_local: str,
                     reporting_end_datetime_local: str,
                     period_type: str,
                     language: str) -> Optional[str]:
        """Generate PDF file from report data."""
        _ = self._

        filename = str(uuid.uuid4()) + '.pdf'

        self.report = _convert_decimals(report)
        self.equipment1_name = equipment1_name
        self.equipment2_name = equipment2_name
        self.energy_category_name = energy_category_name
        self.reporting_start = reporting_start_datetime_local
        self.reporting_end = reporting_end_datetime_local
        self.period_type = period_type

        with PdfPages(filename) as pdf:
            # Cover page
            self._create_cover_page(pdf)

            # Consumption summary table
            self._create_consumption_summary_page(pdf)

            # Line chart for reporting period consumption
            self._create_line_chart(pdf)

            # Detailed data table
            self._create_detailed_data_table(pdf)

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

        # Title - _('Equipment Comparison') translates to "对比分析" in zh_CN
        fig.text(0.5, 0.50, _('Equipment Comparison'),
                 fontsize=24, weight='bold', ha='center', va='center')

        # Info list
        unit = self.report.get('energy_category', {}).get('unit_of_measure', '')
        info_data = [
            [_('Equipment') + '1:', self.equipment1_name],
            [_('Equipment') + '2:', self.equipment2_name],
            [_('Energy Category') + ':', self.energy_category_name],
            [_('Period Type') + ':', self.period_type],
            [_('Reporting Start Datetime') + ':', self.reporting_start],
            [_('Reporting End Datetime') + ':', self.reporting_end],
        ]

        ax_table = fig.add_axes([0.25, 0.08, 0.50, 0.38])
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

    def _create_consumption_summary_page(self, pdf: PdfPages):
        """Create two separate consumption tables matching Excel layout.
        Excel has:
          - Equipment1 name as title, Consumption row with EC(unit) and total
          - Equipment2 name as title, Consumption row with EC(unit) and total
        """
        _ = self._
        unit = self.report.get('energy_category', {}).get('unit_of_measure', '')
        ec_unit_label = self.energy_category_name + ' (' + unit + ')'

        rp1 = self.report.get('reporting_period1', {})
        rp2 = self.report.get('reporting_period2', {})

        total1 = round2(rp1.get('total_in_category', 0), 2)
        total2 = round2(rp2.get('total_in_category', 0), 2)

        fig = plt.figure(figsize=self.page_size)
        fig.suptitle(_('Consumption'), fontsize=16, weight='bold', y=0.95)

        # --- Equipment1 consumption table ---
        ax1 = fig.add_axes([0.10, 0.55, 0.80, 0.30])
        ax1.axis('off')

        # Equipment1 name as title row
        eq1_table = ax1.table(
            cellText=[[self.equipment1_name], [_('Consumption')]],
            loc='center', cellLoc='center', colWidths=[1.0]
        )
        eq1_table.auto_set_font_size(False)
        eq1_table.set_fontsize(11)
        # Title row (equipment name) - green header
        eq1_table[0, 0].set_facecolor('#90EE90')
        eq1_table[0, 0].set_text_props(weight='bold')
        # Consumption label row
        eq1_table[1, 0].set_facecolor('#90EE90')
        eq1_table[1, 0].set_text_props(weight='bold')
        _style_table_borders(eq1_table, 2, 1)

        # Equipment1 value table (EC header + total value)
        ax1v = fig.add_axes([0.55, 0.55, 0.35, 0.30])
        ax1v.axis('off')

        val1_table = ax1v.table(
            cellText=[[ec_unit_label], [str(total1)]],
            loc='center', cellLoc='center', colWidths=[1.0]
        )
        val1_table.auto_set_font_size(False)
        val1_table.set_fontsize(11)
        val1_table[0, 0].set_facecolor('#90EE90')
        val1_table[0, 0].set_text_props(weight='bold')
        _style_table_borders(val1_table, 2, 1)

        # --- Equipment2 consumption table ---
        ax2 = fig.add_axes([0.10, 0.10, 0.80, 0.30])
        ax2.axis('off')

        eq2_table = ax2.table(
            cellText=[[self.equipment2_name], [_('Consumption')]],
            loc='center', cellLoc='center', colWidths=[1.0]
        )
        eq2_table.auto_set_font_size(False)
        eq2_table.set_fontsize(11)
        eq2_table[0, 0].set_facecolor('#90EE90')
        eq2_table[0, 0].set_text_props(weight='bold')
        eq2_table[1, 0].set_facecolor('#90EE90')
        eq2_table[1, 0].set_text_props(weight='bold')
        _style_table_borders(eq2_table, 2, 1)

        # Equipment2 value table
        ax2v = fig.add_axes([0.55, 0.10, 0.35, 0.30])
        ax2v.axis('off')

        val2_table = ax2v.table(
            cellText=[[ec_unit_label], [str(total2)]],
            loc='center', cellLoc='center', colWidths=[1.0]
        )
        val2_table.auto_set_font_size(False)
        val2_table.set_fontsize(11)
        val2_table[0, 0].set_facecolor('#90EE90')
        val2_table[0, 0].set_text_props(weight='bold')
        _style_table_borders(val2_table, 2, 1)

        pdf.savefig(fig)
        plt.close()

    def _create_line_chart(self, pdf: PdfPages):
        """Create line chart matching Excel's 'Reporting Period Consumption' chart.
        Plots equipment1, equipment2, and difference values over timestamps.
        Excel chart references 3 series (cols 3-5): eq1, eq2, difference.
        """
        _ = self._
        unit = self.report.get('energy_category', {}).get('unit_of_measure', '')

        rp1 = self.report.get('reporting_period1', {})
        rp2 = self.report.get('reporting_period2', {})

        timestamps = rp1.get('timestamps', [])
        values1 = rp1.get('values', [])
        values2 = rp2.get('values', [])

        if not timestamps:
            return

        x_indices = list(range(len(timestamps)))

        fig = plt.figure(figsize=self.page_size)
        fig.suptitle(_('Reporting Period Consumption'),
                     fontsize=16, weight='bold', y=0.95)

        ax = fig.add_axes([0.08, 0.10, 0.88, 0.78])

        eq1_label = self.equipment1_name + ' ' + self.energy_category_name + ' (' + unit + ')'
        eq2_label = self.equipment2_name + ' ' + self.energy_category_name + ' (' + unit + ')'

        # Plot equipment1 line (filter None by paired index)
        valid_pairs1 = [(x, float(y)) for x, y in zip(x_indices, values1)
                        if y is not None]
        if valid_pairs1:
            vx1, vy1 = zip(*valid_pairs1)
            ax.plot(vx1, vy1, marker='o', markersize=3,
                    linewidth=1.5, label=eq1_label)

        # Plot equipment2 line
        valid_pairs2 = [(x, float(y)) for x, y in zip(x_indices, values2)
                        if y is not None]
        if valid_pairs2:
            vx2, vy2 = zip(*valid_pairs2)
            ax.plot(vx2, vy2, marker='s', markersize=3,
                    linewidth=1.5, label=eq2_label)

        # Set x-axis labels (show subset to avoid overlap)
        step = max(1, len(timestamps) // 20)
        tick_positions = list(range(0, len(timestamps), step))
        ax.set_xticks(tick_positions)
        ax.set_xticklabels([timestamps[i] for i in tick_positions],
                           rotation=45, ha='right', fontsize=6)

        ax.set_ylabel(self.energy_category_name + ' (' + unit + ')')
        ax.legend(loc='best', fontsize=8)
        ax.grid(True, linestyle='--', alpha=0.5)

        pdf.savefig(fig)
        plt.close()

    def _create_detailed_data_table(self, pdf: PdfPages):
        """Create detailed data table with timestamps, values, and difference.
        Paginates if too many rows. Matches Excel detailed data section.
        """
        _ = self._
        unit = self.report.get('energy_category', {}).get('unit_of_measure', '')

        rp1 = self.report.get('reporting_period1', {})
        rp2 = self.report.get('reporting_period2', {})
        diff = self.report.get('diff', {})

        timestamps = rp1.get('timestamps', [])
        values1 = rp1.get('values', [])
        values2 = rp2.get('values', [])
        diff_values = diff.get('values', [])

        if not timestamps:
            return

        # Column headers
        col_headers = [
            _('Datetime'),
            self.equipment1_name + ' ' + self.energy_category_name + ' (' + unit + ')',
            self.equipment2_name + ' ' + self.energy_category_name + ' (' + unit + ')',
            _('Difference')
        ]
        total_cols = len(col_headers)

        # Build all data rows
        all_rows = []
        for i in range(len(timestamps)):
            v1 = round2(values1[i], 2) if i < len(values1) and values1[i] is not None else ''
            v2 = round2(values2[i], 2) if i < len(values2) and values2[i] is not None else ''
            vd = round2(diff_values[i], 2) if i < len(diff_values) and diff_values[i] is not None else ''
            all_rows.append([timestamps[i], str(v1), str(v2), str(vd)])

        # Add total row
        total1 = round2(rp1.get('total_in_category', 0), 2)
        total2 = round2(rp2.get('total_in_category', 0), 2)
        total_diff = round2(diff.get('total_in_category', 0), 2)
        all_rows.append([_('Total'), str(total1), str(total2), str(total_diff)])

        # Paginate
        max_rows_per_page = 30
        num_pages = (len(all_rows) + max_rows_per_page - 1) // max_rows_per_page

        for page in range(num_pages):
            start_idx = page * max_rows_per_page
            end_idx = min(start_idx + max_rows_per_page, len(all_rows))
            page_rows = all_rows[start_idx:end_idx]

            fig = plt.figure(figsize=self.page_size)
            if num_pages == 1:
                fig.suptitle(self.equipment1_name + ' and ' + self.equipment2_name + ' ' +
                             _('Detailed Data'),
                             fontsize=14, weight='bold', y=0.98)
            else:
                fig.suptitle(self.equipment1_name + ' and ' + self.equipment2_name + ' ' +
                             _('Detailed Data') + ' (' + str(page + 1) + '/' + str(num_pages) + ')',
                             fontsize=14, weight='bold', y=0.98)

            table_data = [col_headers] + page_rows

            ax = fig.add_axes([0.02, 0.02, 0.96, 0.92])
            ax.axis('off')

            col_widths = [0.25, 0.25, 0.25, 0.25]

            tbl = ax.table(cellText=table_data, loc='center',
                           cellLoc='center', colWidths=col_widths)
            tbl.auto_set_font_size(False)
            tbl.set_fontsize(6)

            # Header row styling
            for j in range(total_cols):
                tbl[0, j].set_facecolor('#90EE90')
                tbl[0, j].set_text_props(weight='bold')

            # Last row (Total) styling
            last_row_idx = len(table_data) - 1
            for j in range(total_cols):
                tbl[last_row_idx, j].set_facecolor('#E8EDF5')
                tbl[last_row_idx, j].set_text_props(weight='bold')

            _style_table_borders(tbl, len(table_data), total_cols)

            pdf.savefig(fig)
            plt.close()


# Convenience function for backward compatibility
def export(report, equipment1_name, equipment2_name, energy_category_name,
           reporting_start_datetime_local, reporting_end_datetime_local,
           period_type, language):
    """
    Export report data to PDF and return base64 encoded string.
    This function maintains the same interface as the Excel exporter.
    """
    exporter = EquipmentComparisonPDFExporter(language)
    return exporter.export(report, equipment1_name, equipment2_name, energy_category_name,
                           reporting_start_datetime_local, reporting_end_datetime_local,
                           period_type, language)
