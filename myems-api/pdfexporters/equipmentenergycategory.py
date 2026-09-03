"""
Equipment Energy Category PDF Exporter

This module provides functionality to export equipment energy category data to PDF format.
It generates comprehensive reports showing energy consumption breakdown by categories
for equipment with detailed analysis and visualizations.

Key Features:
- Equipment energy consumption by category
- Base period vs reporting period comparison
- Energy category proportion analysis
- Detailed data with charts
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Energy consumption summary by category
- Base period comparison data
- Category proportion analysis with pie charts
- Detailed time-series data with line charts
- Parameter data (if available)
"""

import base64
import os
import time
import uuid


from decimal import Decimal
from typing import Optional, Dict, List, Any
import logging

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend to avoid GUI thread warnings
import matplotlib.pyplot as plt

from matplotlib.backends.backend_pdf import PdfPages

import matplotlib.gridspec as gridspec


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

    # Use bundled NotoSansCJK font for cross-platform CJK support
    font_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                             'fonts', 'NotoSansCJK-Regular.ttc')
    try:
        import matplotlib.font_manager as fm
        # Register the font file with matplotlib font manager
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

    # Fallback to DejaVu Sans (may not display Chinese properly)
    plt.rcParams['font.sans-serif'] = ['DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False
    logger.warning("Failed to load bundled NotoSansCJK font, using DejaVu Sans "
                   "(Chinese may not display correctly)")
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


def _style_table_header(table, num_cols, header_color='#4472C4'):
    """Style table header row with background color and white bold text."""
    for j in range(num_cols):
        table[0, j].set_facecolor(header_color)
        table[0, j].set_text_props(color='white', weight='bold')


def _style_table_alternate(table, num_rows, num_cols, alternate_color='#E8EDF5'):
    """Style alternating rows in a table."""
    for i in range(1, num_rows):
        for j in range(num_cols):
            if i % 2 == 0:
                table[i, j].set_facecolor(alternate_color)


def _style_table_borders(table, num_rows, num_cols):
    """Add borders to all cells in a table."""
    for i in range(num_rows):
        for j in range(num_cols):
            table[i, j].set_edgecolor('#333333')
            table[i, j].set_linewidth(0.5)


class EquipmentEnergyPDFExporter:
    """
    Export equipment energy category data to PDF format.
    Generates comprehensive reports with charts and tables matching Excel layout.
    """

    def __init__(self, language: str = 'zh_CN'):
        """
        Initialize the PDF exporter.

        Args:
            language: Language code ('zh_CN', 'en_US', etc.)
        """
        # Setup Chinese fonts lazily on first instantiation
        font_setup_success = setup_chinese_fonts()
        if not font_setup_success:
            logger.warning("Chinese font setup failed, some text may not display correctly")

        self.language = language
        self.trans = get_translation(language)
        # Do NOT call self.trans.install() - it modifies global builtins._
        # which causes language cross-contamination in concurrent requests.
        # Use instance-level gettext via self._ instead.
        self._ = self.trans.gettext

        # Page settings
        self.page_size = (11.69, 8.27)  # A4 landscape
        self.dpi = 80

        # Color scheme (matching Excel style)
        self.colors = {
            'primary': '#4472C4',
            'secondary': '#ED7D31',
            'success': '#70AD47',
            'info': '#5B9BD5',
            'warning': '#FFC000',
            'danger': '#FF6B6B',
            'light': '#E8EDF5',
            'dark': '#2F2F2F',
            'table_header': '#4472C4',
            'table_green': '#90EE90',
            'table_alternate': '#E8EDF5',
            'chart_colors': ['#4472C4', '#ED7D31', '#70AD47', '#FFC000', '#5B9BD5',
                             '#FF6B6B', '#9B59B6', '#1ABC9C', '#E67E22', '#2ECC71',
                             '#3498DB', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6']
        }

    def export(self,
               report: Dict[str, Any],
               name: str,
               base_period_start_datetime_local: str,
               base_period_end_datetime_local: str,
               reporting_start_datetime_local: str,
               reporting_end_datetime_local: str,
               period_type: str,
               language: str) -> Optional[str]:
        """
        Export report data to PDF and return base64 encoded string.
        """
        if report is None:
            return None
        start_time = time.time()
        logger.info(f"Starting PDF generation for {name}")
        # Generate PDF file
        pdf_filename = self.generate_pdf(
            report, name,
            base_period_start_datetime_local,
            base_period_end_datetime_local,
            reporting_start_datetime_local,
            reporting_end_datetime_local,
            period_type,
            language
        )

        # Encode to base64
        result = ''
        if pdf_filename and os.path.exists(pdf_filename):
            try:
                with open(pdf_filename, 'rb') as binary_file:
                    binary_data = binary_file.read()
                result = base64.b64encode(binary_data).decode('utf-8')
            except Exception as e:
                logger.error(f"Failed to encode PDF: {str(e)}")
            finally:
                # Clean up
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
                     base_period_start_datetime_local: str,
                     base_period_end_datetime_local: str,
                     reporting_start_datetime_local: str,
                     reporting_end_datetime_local: str,
                     period_type: str,
                     language: str) -> Optional[str]:
        """
        Generate PDF file from report data.
        """
        _ = self._

        # Check if there is data
        if "reporting_period" not in report.keys() or \
                "names" not in report['reporting_period'].keys() or \
                len(report['reporting_period']['names']) == 0:
            # Generate empty PDF
            filename = str(uuid.uuid4()) + '.pdf'
            with PdfPages(filename) as pdf:
                self._create_cover_page(pdf, name, period_type,
                                        reporting_start_datetime_local,
                                        reporting_end_datetime_local,
                                        base_period_start_datetime_local,
                                        base_period_end_datetime_local,
                                        False)
            return filename

        # Generate unique filename
        filename = str(uuid.uuid4()) + '.pdf'

        # Prepare data for PDF generation
        self.report = _convert_decimals(report)
        self.name = name
        self.base_period_start = base_period_start_datetime_local
        self.base_period_end = base_period_end_datetime_local
        self.reporting_start = reporting_start_datetime_local
        self.reporting_end = reporting_end_datetime_local
        self.period_type = period_type

        # Check if base period exists
        self.is_base_period_exists = self._is_base_period_timestamp_exists(report['base_period'])

        # Generate PDF
        with PdfPages(filename) as pdf:
            # Cover page
            self._create_cover_page(pdf, name, period_type,
                                    reporting_start_datetime_local,
                                    reporting_end_datetime_local,
                                    base_period_start_datetime_local,
                                    base_period_end_datetime_local,
                                    self.is_base_period_exists)

            # Combined analysis: Reporting Period Consumption + Time-of-use, TCE, TCO2E (table top + 3 columns below)
            self._create_combined_analysis_page(pdf)

            # Detailed data
            self._create_detailed_data_page(pdf)

            # Parameters
            self._create_parameters_page(pdf)

        logger.info(f"PDF generated: {filename}")
        return filename

    def _create_cover_page(self, pdf: PdfPages, name: str, period_type: str,
                           reporting_start: str, reporting_end: str,
                           base_period_start: str, base_period_end: str,
                           has_base_period: bool):
        """Create cover page with logo, centered title, and borderless info list."""
        _ = self._
        fig = plt.figure(figsize=self.page_size)

        # ===== Logo image: 50% scale, centered above title =====
        img_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                '..', 'excelexporters', 'myems.png')
        if os.path.exists(img_path):
            try:
                img = plt.imread(img_path)
                # Original: 530x90 px; at 100% scale display
                img_w_inch = img.shape[1] / self.dpi
                img_h_inch = img.shape[0] / self.dpi
                page_w, page_h = self.page_size
                # Convert inches to figure-relative coordinates
                ax_img = fig.add_axes([0.5 - img_w_inch / page_w / 2,
                                        0.62,
                                        img_w_inch / page_w,
                                        img_h_inch / page_h])
                ax_img.imshow(img)
                ax_img.axis('off')
            except Exception as e:
                logger.warning(f"Failed to load logo image: {e}")

        # ===== Title: large bold text centered on page =====
        fig.text(0.5, 0.50, _('Energy Analysis'),
                 fontsize=24, weight='bold', ha='center', va='center')

        # ===== Info list: no table borders, centered below title =====
        info_data = [
            [_('Name') + ':', name],
            [_('Period Type') + ':', period_type],
            [_('Reporting Start Datetime') + ':', reporting_start],
            [_('Reporting End Datetime') + ':', reporting_end],
        ]
        if has_base_period:
            info_data.append([_('Base Period Start Datetime') + ':', base_period_start])
            info_data.append([_('Base Period End Datetime') + ':', base_period_end])

        ax_table = fig.add_axes([0.25, 0.10, 0.50, 0.35])
        ax_table.axis('off')

        table = ax_table.table(cellText=info_data, loc='center',
                                cellLoc='center', colWidths=[0.35, 0.65])
        table.auto_set_font_size(False)
        table.set_fontsize(12)

        # Remove all borders, style labels and values
        for i in range(len(info_data)):
            for j in [0, 1]:
                table[i, j].set_edgecolor('white')
                table[i, j].set_linewidth(0)
            table[i, 0].set_text_props(ha='right')
            table[i, 1].get_text().set_ha('center')

        pdf.savefig(fig)
        plt.close()

    def _create_combined_analysis_page(self, pdf: PdfPages):
        """Create combined analysis page: Reporting Period Consumption table on top row,
        then 3 columns (Time-of-use, TCE, TCO2E) below, each with table + pie chart.
        """
        _ = self._
        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        subtotals = reporting_data.get('subtotals', [])
        increment_rates = reporting_data.get('increment_rates', [])
        ca_len = len(names)

        # --- Build Reporting Period Consumption table data ---
        rp_col_headers = ['']
        for i in range(ca_len):
            rp_col_headers.append(names[i] + ' (' + units[i] + ')')
        rp_col_headers.append(_('Ton of Standard Coal') + '(TCE)')
        rp_col_headers.append(_('Ton of Carbon Dioxide Emissions') + '(TCO2E)')

        rp_consumption_row = [_('Consumption')]
        for i in range(ca_len):
            rp_consumption_row.append(str(round2(subtotals[i], 2)))
        total_kgce = reporting_data.get('total_in_kgce', 0)
        total_kgco2e = reporting_data.get('total_in_kgco2e', 0)
        rp_consumption_row.append(str(round2(total_kgce / 1000, 2)))
        rp_consumption_row.append(str(round2(total_kgco2e / 1000, 2)))

        rp_increment_row = [_('Increment Rate')]
        for i in range(ca_len):
            val = increment_rates[i] if increment_rates and i < len(increment_rates) else None
            rp_increment_row.append(str(round2(val * 100, 2)) + '%' if val is not None else '')
        inc_kgce = reporting_data.get('increment_rate_in_kgce', None)
        inc_kgco2e = reporting_data.get('increment_rate_in_kgco2e', None)
        rp_increment_row.append(str(round2(inc_kgce * 100, 2)) + '%' if inc_kgce is not None else '')
        rp_increment_row.append(str(round2(inc_kgco2e * 100, 2)) + '%' if inc_kgco2e is not None else '')

        rp_table_data = [rp_col_headers, rp_consumption_row, rp_increment_row]

        # --- Column 1: Time-of-use electricity consumption ---
        electricity_index = -1
        for i in range(len(reporting_data.get('energy_category_ids', []))):
            if reporting_data['energy_category_ids'][i] == 1:
                electricity_index = i
                break

        tou_exists = electricity_index >= 0
        tou_categories = [_('TopPeak'), _('OnPeak'), _('MidPeak'), _('OffPeak')]
        tou_values = []
        if tou_exists:
            toppeaks = reporting_data.get('toppeaks', [])
            onpeaks = reporting_data.get('onpeaks', [])
            midpeaks = reporting_data.get('midpeaks', [])
            offpeaks = reporting_data.get('offpeaks', [])
            tou_values = [
                round2(toppeaks[electricity_index], 2) if electricity_index < len(toppeaks) else 0,
                round2(onpeaks[electricity_index], 2) if electricity_index < len(onpeaks) else 0,
                round2(midpeaks[electricity_index], 2) if electricity_index < len(midpeaks) else 0,
                round2(offpeaks[electricity_index], 2) if electricity_index < len(offpeaks) else 0
            ]

        # --- Column 2: TCE by category ---
        subtotals_in_kgce = reporting_data.get('subtotals_in_kgce', [])
        tce_exists = subtotals_in_kgce and sum(subtotals_in_kgce) > 0
        tce_values = [round2(v / 1000, 3) for v in subtotals_in_kgce] if tce_exists else []

        # --- Column 3: CO2E by category ---
        subtotals_in_kgco2e = reporting_data.get('subtotals_in_kgco2e', [])
        co2e_exists = subtotals_in_kgco2e and sum(subtotals_in_kgco2e) > 0
        co2e_values = [round2(v / 1000, 3) for v in subtotals_in_kgco2e] if co2e_exists else []

        # Skip page if no reporting data and no analysis data
        has_rp_data = "names" in reporting_data.keys() and reporting_data['names'] is not None
        if not has_rp_data and not tou_exists and not tce_exists and not co2e_exists:
            return

        fig = plt.figure(figsize=self.page_size)
        fig.suptitle(self.name + ' - ' + _('Reporting Period Consumption'),
                     fontsize=16, weight='bold', y=0.98)

        # Layout: top row = Reporting Period table (full width)
        #         bottom area = 3 columns x 2 sub-rows (tables + pie charts)
        gs_main = gridspec.GridSpec(2, 1, height_ratios=[0.25, 0.75], hspace=0.30)

        # ===== Top row: Reporting Period Consumption table (full width) =====
        ax_rp = fig.add_subplot(gs_main[0])
        ax_rp.axis('off')

        rp_num_cols = len(rp_col_headers)
        rp_col_widths = [0.12] + [0.08] * (rp_num_cols - 1)
        rp_total_w = sum(rp_col_widths)
        rp_col_widths = [w / rp_total_w for w in rp_col_widths]

        if has_rp_data:
            tbl_rp = ax_rp.table(cellText=rp_table_data, loc='center',
                                  cellLoc='center', colWidths=rp_col_widths)
            tbl_rp.auto_set_font_size(False)
            tbl_rp.set_fontsize(7)
            for j in range(rp_num_cols):
                tbl_rp[0, j].set_facecolor('#90EE90')
                tbl_rp[0, j].set_text_props(weight='bold')
            for i in range(1, len(rp_table_data)):
                tbl_rp[i, 0].set_facecolor('#90EE90')
                tbl_rp[i, 0].set_text_props(weight='bold')
            _style_table_borders(tbl_rp, len(rp_table_data), rp_num_cols)

        # ===== Bottom area: 3 columns (Time-of-use, TCE, TCO2E) =====
        gs_bottom = gridspec.GridSpecFromSubplotSpec(
            2, 3, subplot_spec=gs_main[1],
            height_ratios=[0.35, 0.65], wspace=0.25, hspace=0.20)

        # ===== Column 1: Time-of-use electricity =====
        ax_table1 = fig.add_subplot(gs_bottom[0, 0])
        ax_table1.axis('off')
        ax_chart1 = fig.add_subplot(gs_bottom[1, 0])

        tou_table_data = [
            ['', _('Electricity Consumption by Time-Of-Use')],
            [_('TopPeak'), str(tou_values[0]) if tou_exists else ''],
            [_('OnPeak'), str(tou_values[1]) if tou_exists else ''],
            [_('MidPeak'), str(tou_values[2]) if tou_exists else ''],
            [_('OffPeak'), str(tou_values[3]) if tou_exists else ''],
        ]
        tbl1 = ax_table1.table(cellText=tou_table_data, loc='center',
                                cellLoc='center', colWidths=[0.4, 0.6])
        tbl1.auto_set_font_size(False)
        tbl1.set_fontsize(9)
        tbl1[0, 0].set_facecolor('#90EE90')
        tbl1[0, 0].set_text_props(weight='bold')
        tbl1[0, 1].set_facecolor('#90EE90')
        tbl1[0, 1].set_text_props(weight='bold')
        _style_table_borders(tbl1, len(tou_table_data), 2)

        if tou_exists:
            tou_colors = ['#FF1744', '#FF6F00', '#FDD835', '#00BCD4']
            tou_total = sum(tou_values)
            if tou_total > 0:
                ax_chart1.pie(tou_values, labels=tou_categories, autopct='%1.1f%%',
                               colors=tou_colors, startangle=90)
            ax_chart1.set_title(_('Electricity Consumption by Time-Of-Use'),
                                 fontsize=9, weight='bold')
        else:
            ax_chart1.text(0.5, 0.5, _('No data'), fontsize=12,
                            ha='center', va='center', transform=ax_chart1.transAxes)
            ax_chart1.axis('off')

        # ===== Column 2: TCE by category =====
        ax_table2 = fig.add_subplot(gs_bottom[0, 1])
        ax_table2.axis('off')
        ax_chart2 = fig.add_subplot(gs_bottom[1, 1])

        tce_table_data = [['', _('Ton of Standard Coal(TCE) by Energy Category')]]
        if tce_exists:
            for i in range(len(names)):
                tce_table_data.append([names[i], str(tce_values[i])])
        tbl2 = ax_table2.table(cellText=tce_table_data, loc='center',
                                cellLoc='center', colWidths=[0.4, 0.6])
        tbl2.auto_set_font_size(False)
        tbl2.set_fontsize(8)
        tbl2[0, 0].set_facecolor('#90EE90')
        tbl2[0, 0].set_text_props(weight='bold')
        tbl2[0, 1].set_facecolor('#90EE90')
        tbl2[0, 1].set_text_props(weight='bold')
        _style_table_borders(tbl2, len(tce_table_data), 2)

        if tce_exists:
            tce_filtered = [(n, v) for n, v in zip(names, tce_values) if v > 0]
            if tce_filtered:
                tce_fn, tce_fv = zip(*tce_filtered)
                tce_colors = self.colors['chart_colors'][:len(tce_fn)]
                ax_chart2.pie(tce_fv, labels=tce_fn, autopct='%1.1f%%', colors=tce_colors)
            ax_chart2.set_title(_('Ton of Standard Coal(TCE) by Energy Category'),
                                 fontsize=9, weight='bold')
        else:
            ax_chart2.text(0.5, 0.5, _('No data'), fontsize=12,
                            ha='center', va='center', transform=ax_chart2.transAxes)
            ax_chart2.axis('off')

        # ===== Column 3: CO2E by category =====
        ax_table3 = fig.add_subplot(gs_bottom[0, 2])
        ax_table3.axis('off')
        ax_chart3 = fig.add_subplot(gs_bottom[1, 2])

        co2e_table_data = [['', _('Ton of Carbon Dioxide Emissions(TCO2E) by Energy Category')]]
        if co2e_exists:
            for i in range(len(names)):
                co2e_table_data.append([names[i], str(co2e_values[i])])
        tbl3 = ax_table3.table(cellText=co2e_table_data, loc='center',
                                cellLoc='center', colWidths=[0.4, 0.6])
        tbl3.auto_set_font_size(False)
        tbl3.set_fontsize(8)
        tbl3[0, 0].set_facecolor('#90EE90')
        tbl3[0, 0].set_text_props(weight='bold')
        tbl3[0, 1].set_facecolor('#90EE90')
        tbl3[0, 1].set_text_props(weight='bold')
        _style_table_borders(tbl3, len(co2e_table_data), 2)

        if co2e_exists:
            co2e_filtered = [(n, v) for n, v in zip(names, co2e_values) if v > 0]
            if co2e_filtered:
                co2e_fn, co2e_fv = zip(*co2e_filtered)
                co2e_colors = self.colors['chart_colors'][:len(co2e_fn)]
                ax_chart3.pie(co2e_fv, labels=co2e_fn, autopct='%1.1f%%', colors=co2e_colors)
            ax_chart3.set_title(_('Ton of Carbon Dioxide Emissions(TCO2E) by Energy Category'),
                                 fontsize=9, weight='bold')
        else:
            ax_chart3.text(0.5, 0.5, _('No data'), fontsize=12,
                            ha='center', va='center', transform=ax_chart3.transAxes)
            ax_chart3.axis('off')

        pdf.savefig(fig)
        plt.close()

    def _create_detailed_data_page(self, pdf: PdfPages):
        """Create detailed data page matching Excel full data table + line charts."""
        _ = self._

        reporting_data = self.report['reporting_period']
        timestamps = reporting_data.get('timestamps', [])

        if not timestamps or len(timestamps[0]) == 0:
            return

        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        values = reporting_data.get('values', [])
        subtotals = reporting_data.get('subtotals', [])
        ca_len = len(names)

        rows_per_page = 50

        if not self.is_base_period_exists:
            # No base period: paginated table + combined chart per page
            times = timestamps[0]
            if len(times) == 0:
                return

            num_pages = (len(times) + rows_per_page - 1) // rows_per_page
            marker_step = max(1, rows_per_page // 15)

            for page in range(num_pages):
                start_row = page * rows_per_page
                end_row = min(start_row + rows_per_page, len(times))

                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + ' ' + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

                gs = gridspec.GridSpec(2, 1, height_ratios=[0.55, 0.45])
                ax_table = fig.add_subplot(gs[0])
                ax_table.axis('off')

                # Table header
                col_headers = [_('Datetime')]
                for i in range(ca_len):
                    col_headers.append(names[i] + ' (' + units[i] + ')')

                table_data = [col_headers]
                for t_idx in range(start_row, end_row):
                    row = [times[t_idx]]
                    for j in range(ca_len):
                        val = round2(values[j][t_idx], 2) if j < len(values) and t_idx < len(values[j]) else ''
                        row.append(str(val))
                    table_data.append(row)

                # Subtotal row
                subtotal_row = [_('Subtotal')]
                for i in range(ca_len):
                    subtotal_row.append(str(round2(subtotals[i], 2)) if i < len(subtotals) else '')
                table_data.append(subtotal_row)

                num_cols = len(col_headers)
                col_widths = [0.15] + [0.85 / ca_len] * ca_len
                table = ax_table.table(cellText=table_data, loc='center',
                                       cellLoc='center', colWidths=col_widths)
                table.auto_set_font_size(False)
                table.set_fontsize(7)

                for j in range(num_cols):
                    table[0, j].set_facecolor('#90EE90')
                    table[0, j].set_text_props(weight='bold')
                last_row = len(table_data) - 1
                for j in range(num_cols):
                    table[last_row, j].set_facecolor('#E8EDF5')
                    table[last_row, j].set_text_props(weight='bold')
                _style_table_borders(table, len(table_data), num_cols)

                # Combined line chart - all categories overlaid
                ax_chart = fig.add_subplot(gs[1])
                for i in range(ca_len):
                    data = values[i] if i < len(values) else []
                    page_data = data[start_row:end_row]
                    color = self.colors['chart_colors'][i % len(self.colors['chart_colors'])]
                    ax_chart.plot(range(len(page_data)), page_data, linewidth=1.2,
                                  color=color, label=names[i],
                                  marker='o', markersize=3, markevery=marker_step)
                step = max(1, (end_row - start_row) // 8)
                ax_chart.set_xticks(range(0, end_row - start_row, step))
                ax_chart.set_xticklabels([times[start_row + t][:10] for t in range(0, end_row - start_row, step)],
                                         rotation=45, ha='right', fontsize=7)
                ax_chart.set_title(_('Reporting Period Consumption') + ' (' +
                                   str(start_row + 1) + '-' + str(end_row) + ')',
                                   fontsize=10, weight='bold')
                ax_chart.legend(fontsize=6, loc='upper right', ncol=min(ca_len, 3))
                ax_chart.grid(True, alpha=0.3)

                plt.tight_layout()
                pdf.savefig(fig)
                plt.close()
        else:
            # With base period: paginated table + combined comparison chart per page
            base_period_data = self.report['base_period']
            base_timestamps = base_period_data.get('timestamps', [])
            base_values = base_period_data.get('values', [])
            base_subtotals = base_period_data.get('subtotals', [])
            base_names = base_period_data.get('names', [])
            base_units = base_period_data.get('units', [])
            base_ca_len = len(base_names)
            reporting_ca_len = ca_len

            base_times = base_timestamps[0] if base_timestamps else []
            reporting_times = timestamps[0]

            max_len = max(len(base_times), len(reporting_times))
            num_pages = (max_len + rows_per_page - 1) // rows_per_page
            marker_step = max(1, rows_per_page // 15)

            for page in range(num_pages):
                start_row = page * rows_per_page
                end_row = min(start_row + rows_per_page, max_len)

                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + ' ' + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

                gs = gridspec.GridSpec(2, 1, height_ratios=[0.55, 0.45])
                ax_table = fig.add_subplot(gs[0])
                ax_table.axis('off')

                col_headers = [_('Base Period') + ' - ' + _('Datetime')]
                for i in range(base_ca_len):
                    col_headers.append(_('Base Period') + ' - ' + base_names[i] + ' (' + base_units[i] + ')')
                col_headers.append(_('Reporting Period') + ' - ' + _('Datetime'))
                for i in range(reporting_ca_len):
                    col_headers.append(_('Reporting Period') + ' - ' + names[i] + ' (' + units[i] + ')')

                table_data = [col_headers]
                for t_idx in range(start_row, end_row):
                    row = []
                    row.append(base_times[t_idx] if t_idx < len(base_times) else '')
                    for j in range(base_ca_len):
                        if t_idx < len(base_values[j]):
                            row.append(str(round2(base_values[j][t_idx], 2)))
                        else:
                            row.append('')
                    row.append(reporting_times[t_idx] if t_idx < len(reporting_times) else '')
                    for j in range(reporting_ca_len):
                        if t_idx < len(values[j]):
                            row.append(str(round2(values[j][t_idx], 2)))
                        else:
                            row.append('')
                    table_data.append(row)

                subtotal_row = [_('Subtotal')]
                for i in range(base_ca_len):
                    subtotal_row.append(str(round2(base_subtotals[i], 2)) if i < len(base_subtotals) else '')
                subtotal_row.append(_('Subtotal'))
                for i in range(reporting_ca_len):
                    subtotal_row.append(str(round2(subtotals[i], 2)) if i < len(subtotals) else '')
                table_data.append(subtotal_row)

                num_cols = len(col_headers)
                col_widths = [1.0 / num_cols] * num_cols
                table = ax_table.table(cellText=table_data, loc='center',
                                       cellLoc='center', colWidths=col_widths)
                table.auto_set_font_size(False)
                table.set_fontsize(6)

                for j in range(num_cols):
                    table[0, j].set_facecolor('#90EE90')
                    table[0, j].set_text_props(weight='bold')
                last_row = len(table_data) - 1
                for j in range(num_cols):
                    table[last_row, j].set_facecolor('#E8EDF5')
                    table[last_row, j].set_text_props(weight='bold')
                _style_table_borders(table, len(table_data), num_cols)

                # Combined comparison chart
                ax_chart = fig.add_subplot(gs[1])
                for i in range(reporting_ca_len):
                    r_data = values[i] if i < len(values) else []
                    r_page = r_data[start_row:end_row]
                    color = self.colors['chart_colors'][i % len(self.colors['chart_colors'])]
                    ax_chart.plot(range(len(r_page)), r_page, linewidth=1.2,
                                  color=color, marker='o', markersize=3, markevery=marker_step,
                                  label=_('Reporting Period') + ' - ' + names[i])
                    if i < len(base_values):
                        b_data = base_values[i]
                        b_page = b_data[start_row:end_row]
                        ax_chart.plot(range(len(b_page)), b_page, linewidth=1.2,
                                      color=color, linestyle='--', marker='s', markersize=3,
                                      markevery=marker_step,
                                      label=_('Base Period') + ' - ' + base_names[i])
                step = max(1, (end_row - start_row) // 8)
                ax_chart.set_xticks(range(0, end_row - start_row, step))
                ax_chart.set_xticklabels(
                    [reporting_times[start_row + t][:10] if start_row + t < len(reporting_times) else ''
                     for t in range(0, end_row - start_row, step)],
                    rotation=45, ha='right', fontsize=7)
                ax_chart.set_title(str(start_row + 1) + '-' + str(end_row),
                                   fontsize=9, weight='bold')
                ax_chart.legend(fontsize=5, loc='upper right', ncol=2)
                ax_chart.grid(True, alpha=0.3)

                plt.tight_layout()
                pdf.savefig(fig)
                plt.close()

    def _create_parameters_page(self, pdf: PdfPages):
        """Create parameters pages: batch 4 parameters per page with compact table + chart."""
        _ = self._

        params = self.report.get('parameters', {})
        if not params or not params.get('names') or not params.get('timestamps'):
            return

        param_names = params.get('names', [])
        timestamps = params.get('timestamps', [])
        values = params.get('values', [])

        # Check if all timestamps are zero
        all_zero = True
        for ts_list in timestamps:
            if ts_list and len(ts_list) > 0:
                all_zero = False
                break
        if all_zero:
            return

        # Batch 4 parameters per page for efficiency
        batch_size = 4
        rows_per_param = 25
        num_batches = (len(param_names) + batch_size - 1) // batch_size

        for batch in range(num_batches):
            batch_start = batch * batch_size
            batch_end = min(batch_start + batch_size, len(param_names))
            batch_params = list(range(batch_start, batch_end))

            # Filter out invalid parameters
            valid_params = []
            for i in batch_params:
                if i < len(timestamps) and len(timestamps[i]) > 0:
                    if i < len(values) and len(values[i]) > 0:
                        valid_params.append(i)
            if not valid_params:
                continue

            fig = plt.figure(figsize=self.page_size)
            fig.suptitle(self.name + ' ' + _('Parameters') +
                         ' (' + str(batch_start + 1) + '-' + str(batch_end) + ')',
                         fontsize=16, weight='bold', y=0.98)

            gs = gridspec.GridSpec(len(valid_params), 2, width_ratios=[0.35, 0.65],
                                   hspace=0.30)

            for idx, pi in enumerate(valid_params):
                name = param_names[pi]
                times = timestamps[pi]
                data = values[pi]
                data_len = len(times)

                # Compact table (first 25 rows)
                ax_tbl = fig.add_subplot(gs[idx, 0])
                ax_tbl.axis('off')
                tbl_rows = min(rows_per_param, data_len)
                tbl_data = [[_('Time'), name]]
                for j in range(tbl_rows):
                    tbl_data.append([times[j], str(round2(data[j], 2))])
                tbl = ax_tbl.table(cellText=tbl_data, loc='upper center',
                                   cellLoc='center', colWidths=[0.5, 0.5])
                tbl.auto_set_font_size(False)
                tbl.set_fontsize(5)
                tbl[0, 0].set_facecolor('#90EE90')
                tbl[0, 0].set_text_props(weight='bold')
                tbl[0, 1].set_facecolor('#90EE90')
                tbl[0, 1].set_text_props(weight='bold')
                _style_table_borders(tbl, len(tbl_data), 2)

                # Line chart with reduced markers
                ax_chart = fig.add_subplot(gs[idx, 1])
                marker_step_p = max(1, data_len // 20)
                ax_chart.plot(range(data_len), data, linewidth=1.2,
                              color='#5B9BD5', marker='o', markersize=3,
                              markevery=marker_step_p, label=name)
                ax_chart.fill_between(range(data_len), data, alpha=0.15, color='#5B9BD5')
                step = max(1, data_len // 8)
                ax_chart.set_xticks(range(0, data_len, step))
                ax_chart.set_xticklabels([times[t][:10] for t in range(0, data_len, step)],
                                         rotation=45, ha='right', fontsize=6)
                ax_chart.set_ylabel(name, fontsize=8)
                ax_chart.set_title(name, fontsize=9, weight='bold')
                ax_chart.grid(True, alpha=0.3)

            pdf.savefig(fig)
            plt.close()

    def _is_base_period_timestamp_exists(self, base_period_data: Dict) -> bool:
        """Check if base period timestamp exists."""
        timestamps = base_period_data.get('timestamps', [])

        if not timestamps:
            return False

        for timestamp in timestamps:
            if timestamp and len(timestamp) > 0:
                return True

        return False


# Convenience function for backward compatibility
def export(report, name, base_period_start_datetime_local,
           base_period_end_datetime_local, reporting_start_datetime_local,
           reporting_end_datetime_local, period_type, language):
    """
    Export report data to PDF and return base64 encoded string.
    This function maintains the same interface as the Excel exporter.
    """
    exporter = EquipmentEnergyPDFExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
