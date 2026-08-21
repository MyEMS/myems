"""
Space Carbon PDF Exporter

This module provides functionality to export space carbon emissions data to PDF format.
It generates comprehensive reports showing carbon dioxide emissions for spaces
with detailed analysis including base period comparison, time-of-use breakdown,
and proportion analysis.

Key Features:
- Space carbon emissions analysis
- Base period vs reporting period comparison
- Time-of-use electricity carbon breakdown
- Carbon emissions proportion charts
- Detailed data tables with separate line charts per energy category
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Cover page with report metadata
- Combined analysis page (reporting period table + time-of-use + carbon proportion)
- Detailed data pages (paginated)
- Parameter data pages
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


def _style_table_borders(table, num_rows, num_cols):
    """Add borders to all cells in a table."""
    for i in range(num_rows):
        for j in range(num_cols):
            table[i, j].set_edgecolor('#333333')
            table[i, j].set_linewidth(0.5)




class SpaceCarbonPDFExporter:
    """
    Export space carbon emissions data to PDF format.
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

            # Combined analysis: Reporting Period Carbon Emissions table +
            # Time-of-use + Carbon proportion by category + Child space proportion
            self._create_combined_analysis_page(pdf)

            # Detailed data table pages
            self._create_detailed_data_page(pdf)

            # Separate line charts for each energy category (matching Excel)
            self._create_detailed_data_charts(pdf)

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

        # ===== Title: breadcrumb last level, internationalized =====
        fig.text(0.5, 0.50, _('Carbon'),
                 fontsize=24, weight='bold', ha='center', va='center')

        # ===== Info list =====
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

        # Remove all borders
        for i in range(len(info_data)):
            for j in [0, 1]:
                table[i, j].set_edgecolor('white')
                table[i, j].set_linewidth(0)
            table[i, 0].set_text_props(ha='right')
            table[i, 1].get_text().set_ha('center')

        pdf.savefig(fig)
        plt.close()

    def _create_combined_analysis_page(self, pdf: PdfPages):
        """Create combined analysis page: Reporting Period Carbon Emissions table on top row,
        then 2 columns (Time-of-use, Carbon proportion by category) below.
        Content matches Excel export exactly - no extra sections.
        """
        _ = self._
        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        subtotals = reporting_data.get('subtotals', [])
        subtotals_per_unit_area = reporting_data.get('subtotals_per_unit_area', [])
        increment_rates = reporting_data.get('increment_rates', [])
        total_unit = reporting_data.get('total_unit', 'KGCO2E')
        ca_len = len(names)

        # --- Build Reporting Period Carbon Emissions table data ---
        rp_col_headers = ['']
        for i in range(ca_len):
            rp_col_headers.append(names[i] + ' (' + units[i] + ')')
        rp_col_headers.append(_('Total') + '(' + total_unit + ')')

        rp_emissions_row = [_('Carbon Dioxide Emissions')]
        for i in range(ca_len):
            rp_emissions_row.append(str(round2(subtotals[i], 2)))
        rp_emissions_row.append(str(round2(reporting_data.get('total', 0), 2)))

        rp_per_area_row = [_('Per Unit Area')]
        for i in range(ca_len):
            val = subtotals_per_unit_area[i] if subtotals_per_unit_area and i < len(subtotals_per_unit_area) else None
            rp_per_area_row.append(str(round2(val, 2)) if val is not None else '')
        total_per_area = reporting_data.get('total_per_unit_area', None)
        rp_per_area_row.append(str(round2(total_per_area, 2)) if total_per_area is not None else '')

        rp_increment_row = [_('Increment Rate')]
        for i in range(ca_len):
            val = increment_rates[i] if increment_rates and i < len(increment_rates) else None
            rp_increment_row.append(str(round2(val * 100, 2)) + '%' if val is not None else '')
        total_inc_rate = reporting_data.get('total_increment_rate', None)
        rp_increment_row.append(str(round2(total_inc_rate * 100, 2)) + '%' if total_inc_rate is not None else '')

        rp_table_data = [rp_col_headers, rp_emissions_row, rp_per_area_row, rp_increment_row]

        # --- Column 1: Time-of-use electricity carbon emissions ---
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

        # --- Column 2: Carbon proportion by category ---
        carbon_exists = subtotals and sum(subtotals) > 0
        carbon_values = [round2(v, 3) for v in subtotals] if carbon_exists else []

        fig = plt.figure(figsize=self.page_size)
        fig.suptitle(self.name + ' - ' + _('Reporting Period Carbon Dioxide Emissions'),
                     fontsize=16, weight='bold', y=0.98)

        # Layout: top row = Reporting Period table (full width)
        #         bottom area = 2 columns (Time-of-use + Carbon proportion)
        gs_main = gridspec.GridSpec(2, 1, height_ratios=[0.28, 0.72], hspace=0.30)

        # ===== Top row: Reporting Period Carbon Emissions table =====
        ax_rp = fig.add_subplot(gs_main[0])
        ax_rp.axis('off')

        rp_num_cols = len(rp_col_headers)
        rp_col_widths = [0.15] + [0.08] * (rp_num_cols - 1)
        rp_total_w = sum(rp_col_widths)
        rp_col_widths = [w / rp_total_w for w in rp_col_widths]

        tbl_rp = ax_rp.table(cellText=rp_table_data, loc='center',
                              cellLoc='center', colWidths=rp_col_widths)
        tbl_rp.auto_set_font_size(False)
        tbl_rp.set_fontsize(7)
        for j in range(rp_num_cols):
            tbl_rp[0, j].set_facecolor('#90EE90')
            tbl_rp[0, j].set_text_props(weight='bold')
        for i in range(1, 4):
            tbl_rp[i, 0].set_facecolor('#90EE90')
            tbl_rp[i, 0].set_text_props(weight='bold')
        _style_table_borders(tbl_rp, len(rp_table_data), rp_num_cols)

        # ===== Bottom area: 2 columns =====
        gs_bottom = gridspec.GridSpecFromSubplotSpec(
            2, 2, subplot_spec=gs_main[1],
            height_ratios=[0.35, 0.65], wspace=0.25, hspace=0.20)

        # ===== Column 1: Time-of-use electricity carbon =====
        ax_table1 = fig.add_subplot(gs_bottom[0, 0])
        ax_table1.axis('off')
        ax_chart1 = fig.add_subplot(gs_bottom[1, 0])

        tou_table_data = [
            ['', _('Electricity Carbon Dioxide Emissions by Time-Of-Use')],
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
            ax_chart1.set_title(_('Electricity Carbon Dioxide Emissions by Time-Of-Use'),
                                 fontsize=9, weight='bold')
        else:
            ax_chart1.text(0.5, 0.5, _('No data'), fontsize=12,
                            ha='center', va='center', transform=ax_chart1.transAxes)
            ax_chart1.axis('off')

        # ===== Column 2: Carbon proportion by category =====
        ax_table2 = fig.add_subplot(gs_bottom[0, 1])
        ax_table2.axis('off')
        ax_chart2 = fig.add_subplot(gs_bottom[1, 1])

        carbon_table_data = [['', _('Carbon Dioxide Emissions Proportion')]]
        if carbon_exists:
            for i in range(len(names)):
                carbon_table_data.append([names[i], str(carbon_values[i])])
        tbl2 = ax_table2.table(cellText=carbon_table_data, loc='center',
                                cellLoc='center', colWidths=[0.4, 0.6])
        tbl2.auto_set_font_size(False)
        tbl2.set_fontsize(8)
        tbl2[0, 0].set_facecolor('#90EE90')
        tbl2[0, 0].set_text_props(weight='bold')
        tbl2[0, 1].set_facecolor('#90EE90')
        tbl2[0, 1].set_text_props(weight='bold')
        _style_table_borders(tbl2, len(carbon_table_data), 2)

        if carbon_exists:
            carbon_filtered = [(n, v) for n, v in zip(names, carbon_values) if v > 0]
            if carbon_filtered:
                carbon_fn, carbon_fv = zip(*carbon_filtered)
                carbon_colors = self.colors['chart_colors'][:len(carbon_fn)]
                ax_chart2.pie(carbon_fv, labels=carbon_fn, autopct='%1.1f%%', colors=carbon_colors)
            ax_chart2.set_title(_('Carbon Dioxide Emissions Proportion'),
                                 fontsize=9, weight='bold')
        else:
            ax_chart2.text(0.5, 0.5, _('No data'), fontsize=12,
                            ha='center', va='center', transform=ax_chart2.transAxes)
            ax_chart2.axis('off')

        pdf.savefig(fig)
        plt.close()

    def _create_detailed_data_page(self, pdf: PdfPages):
        """Create detailed data table pages matching Excel full data table.
        Charts are created separately in _create_detailed_data_charts.
        """
        _ = self._

        reporting_data = self.report['reporting_period']
        timestamps = reporting_data.get('timestamps', [])

        if not timestamps or len(timestamps[0]) == 0:
            return

        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        values = reporting_data.get('values', [])
        subtotals = reporting_data.get('subtotals', [])
        total_unit = reporting_data.get('total_unit', 'KGCO2E')
        ca_len = len(names)

        rows_per_page = 100

        if not self.is_base_period_exists:
            # No base period: paginated table only
            times = timestamps[0]
            if len(times) == 0:
                return

            num_pages = (len(times) + rows_per_page - 1) // rows_per_page

            for page in range(num_pages):
                start_row = page * rows_per_page
                end_row = min(start_row + rows_per_page, len(times))

                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + ' ' + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

                gs = gridspec.GridSpec(1, 1)
                ax_table = fig.add_subplot(gs[0])
                ax_table.axis('off')

                # Table header
                col_headers = [_('Datetime')]
                for i in range(ca_len):
                    col_headers.append(names[i] + ' (' + units[i] + ')')
                col_headers.append(_('Total') + '(' + total_unit + ')')

                table_data = [col_headers]
                for t_idx in range(start_row, end_row):
                    row = [times[t_idx]]
                    row_total = 0.0
                    for j in range(ca_len):
                        val = round2(values[j][t_idx], 2) if j < len(values) and t_idx < len(values[j]) else ''
                        row.append(str(val))
                        if j < len(values) and t_idx < len(values[j]):
                            row_total += values[j][t_idx]
                    row.append(str(round2(row_total, 2)))
                    table_data.append(row)

                # Subtotal row
                subtotal_row = [_('Subtotal')]
                total_of_subtotals = 0.0
                for i in range(ca_len):
                    subtotal_row.append(str(round2(subtotals[i], 2)) if i < len(subtotals) else '')
                    total_of_subtotals += subtotals[i] if i < len(subtotals) else 0
                subtotal_row.append(str(round2(total_of_subtotals, 2)))
                table_data.append(subtotal_row)

                num_cols = len(col_headers)
                col_widths = [0.12] + [0.88 / (ca_len + 1)] * (ca_len + 1)
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

                pdf.savefig(fig)
                plt.close()
        else:
            # With base period: paginated table only
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

            for page in range(num_pages):
                start_row = page * rows_per_page
                end_row = min(start_row + rows_per_page, max_len)

                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + ' ' + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

                gs = gridspec.GridSpec(1, 1)
                ax_table = fig.add_subplot(gs[0])
                ax_table.axis('off')

                col_headers = [_('Base Period') + ' - ' + _('Datetime')]
                for i in range(base_ca_len):
                    col_headers.append(_('Base Period') + ' - ' + base_names[i] + ' (' + base_units[i] + ')')
                col_headers.append(_('Base Period') + ' - ' + _('Total') + '(' + total_unit + ')')
                col_headers.append(_('Reporting Period') + ' - ' + _('Datetime'))
                for i in range(reporting_ca_len):
                    col_headers.append(_('Reporting Period') + ' - ' + names[i] + ' (' + units[i] + ')')
                col_headers.append(_('Reporting Period') + ' - ' + _('Total') + '(' + total_unit + ')')

                table_data = [col_headers]
                for t_idx in range(start_row, end_row):
                    row = []
                    # Base period
                    row.append(base_times[t_idx] if t_idx < len(base_times) else '')
                    base_total = 0.0
                    for j in range(base_ca_len):
                        if t_idx < len(base_values[j]):
                            row.append(str(round2(base_values[j][t_idx], 2)))
                            base_total += base_values[j][t_idx]
                        else:
                            row.append('')
                    row.append(str(round2(base_total, 2)) if t_idx < len(base_times) else '')
                    # Reporting period
                    row.append(reporting_times[t_idx] if t_idx < len(reporting_times) else '')
                    rp_total = 0.0
                    for j in range(reporting_ca_len):
                        if t_idx < len(values[j]):
                            row.append(str(round2(values[j][t_idx], 2)))
                            rp_total += values[j][t_idx]
                        else:
                            row.append('')
                    row.append(str(round2(rp_total, 2)) if t_idx < len(reporting_times) else '')
                    table_data.append(row)

                subtotal_row = [_('Subtotal')]
                base_total_all = 0.0
                for i in range(base_ca_len):
                    subtotal_row.append(str(round2(base_subtotals[i], 2)) if i < len(base_subtotals) else '')
                    base_total_all += base_subtotals[i] if i < len(base_subtotals) else 0
                subtotal_row.append(str(round2(base_total_all, 2)))
                subtotal_row.append(_('Subtotal'))
                rp_total_all = 0.0
                for i in range(reporting_ca_len):
                    subtotal_row.append(str(round2(subtotals[i], 2)) if i < len(subtotals) else '')
                    rp_total_all += subtotals[i] if i < len(subtotals) else 0
                subtotal_row.append(str(round2(rp_total_all, 2)))
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

                pdf.savefig(fig)
                plt.close()

    def _create_detailed_data_charts(self, pdf: PdfPages):
        """Create separate line charts for each energy category, matching Excel behavior.
        Charts < 5: all on one page. Charts >= 5: paginated, max 4 per page (2x2 grid).
        """
        _ = self._

        reporting_data = self.report['reporting_period']
        timestamps = reporting_data.get('timestamps', [])
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        values = reporting_data.get('values', [])

        if not timestamps or len(timestamps[0]) == 0 or not names:
            return

        reporting_times = timestamps[0]
        num_categories = len(names)
        charts_per_page = 4  # 2x2 grid

        if not self.is_base_period_exists:
            # No base period: paginate charts
            num_pages = (num_categories + charts_per_page - 1) // charts_per_page

            for page in range(num_pages):
                start_idx = page * charts_per_page
                end_idx = min(start_idx + charts_per_page, num_categories)
                page_categories = list(range(start_idx, end_idx))
                n = len(page_categories)

                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + ' ' + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

                # Layout: 1 chart = full width; 2+ charts = 2-column grid
                if n == 1:
                    gs = gridspec.GridSpec(1, 1)
                    axes = [fig.add_subplot(gs[0])]
                else:
                    num_rows = (n + 1) // 2
                    gs = gridspec.GridSpec(num_rows, 2, hspace=0.35, wspace=0.25)
                    axes = []
                    for idx in range(n):
                        row = idx // 2
                        col = idx % 2
                        axes.append(fig.add_subplot(gs[row, col]))

                for idx, i in enumerate(page_categories):
                    ax_chart = axes[idx]
                    data = values[i] if i < len(values) else []
                    color = self.colors['chart_colors'][i % len(self.colors['chart_colors'])]
                    ax_chart.plot(range(len(data)), data, linewidth=1.2,
                                  color=color, marker='o', markersize=3,
                                  markevery=max(1, len(data) // 30))

                    step = max(1, len(data) // 10)
                    ax_chart.set_xticks(range(0, len(data), step))
                    ax_chart.set_xticklabels(
                        [reporting_times[t][:10] for t in range(0, len(data), step)],
                        rotation=45, ha='right', fontsize=7)
                    ax_chart.set_title(_('Reporting Period Carbon Dioxide Emissions') + ' - ' +
                                       names[i] + ' (' + units[i] + ')',
                                       fontsize=9, weight='bold')
                    ax_chart.grid(True, alpha=0.3)

                pdf.savefig(fig)
                plt.close()
        else:
            # With base period: paginate comparison charts
            base_period_data = self.report['base_period']
            base_timestamps = base_period_data.get('timestamps', [])
            base_values = base_period_data.get('values', [])
            base_names = base_period_data.get('names', [])
            base_units = base_period_data.get('units', [])

            num_pages = (num_categories + charts_per_page - 1) // charts_per_page

            for page in range(num_pages):
                start_idx = page * charts_per_page
                end_idx = min(start_idx + charts_per_page, num_categories)
                page_categories = list(range(start_idx, end_idx))
                n = len(page_categories)

                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + ' ' + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

                # Layout: 1 chart = full width; 2+ charts = 2-column grid
                if n == 1:
                    gs = gridspec.GridSpec(1, 1)
                    axes = [fig.add_subplot(gs[0])]
                else:
                    num_rows = (n + 1) // 2
                    gs = gridspec.GridSpec(num_rows, 2, hspace=0.35, wspace=0.25)
                    axes = []
                    for idx in range(n):
                        row = idx // 2
                        col = idx % 2
                        axes.append(fig.add_subplot(gs[row, col]))

                for idx, i in enumerate(page_categories):
                    ax_chart = axes[idx]

                    # Reporting period line
                    r_data = values[i] if i < len(values) else []
                    color = self.colors['chart_colors'][i % len(self.colors['chart_colors'])]
                    ax_chart.plot(range(len(r_data)), r_data, linewidth=1.2,
                                  color=color, marker='o', markersize=3,
                                  markevery=max(1, len(r_data) // 30),
                                  label=_('Reporting Period') + ' - ' + names[i])

                    # Base period line (dashed)
                    if i < len(base_values):
                        b_data = base_values[i]
                        ax_chart.plot(range(len(r_data)), b_data[:len(r_data)], linewidth=1.2,
                                      color=color, linestyle='--', marker='s', markersize=3,
                                      markevery=max(1, len(r_data) // 30),
                                      label=_('Base Period') + ' - ' + base_names[i])

                    step = max(1, len(r_data) // 10)
                    ax_chart.set_xticks(range(0, len(r_data), step))
                    ax_chart.set_xticklabels(
                        [reporting_times[t][:10] if t < len(reporting_times) else ''
                         for t in range(0, len(r_data), step)],
                        rotation=45, ha='right', fontsize=7)
                    ax_chart.set_title(
                        _('Base Period Carbon Dioxide Emissions') + ' / ' +
                        _('Reporting Period Carbon Dioxide Emissions') + ' - ' +
                        names[i] + ' (' + units[i] + ')',
                        fontsize=8, weight='bold')
                    ax_chart.legend(fontsize=7)
                    ax_chart.grid(True, alpha=0.3)

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
    exporter = SpaceCarbonPDFExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
