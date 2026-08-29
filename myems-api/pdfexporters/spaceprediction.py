"""
Space Prediction PDF Exporter

This module provides functionality to export space prediction data to PDF format.
It generates comprehensive reports showing energy prediction analysis for spaces
with detailed breakdown including time-of-use analysis and energy category proportions.

Key Features:
- Space energy prediction analysis
- Base period vs reporting period comparison
- Time-of-use electricity breakdown (TopPeak/OnPeak/MidPeak/OffPeak/Deep)
- TCE/TCO2E breakdown by energy category
- Detailed data tables with separate line charts per energy category
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Cover page with report metadata (Energy Prediction Analysis)
- Combined analysis page (reporting period table + time-of-use + TCE/TCO2E proportion)
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
matplotlib.use('Agg')
import matplotlib.pyplot as plt

from matplotlib.backends.backend_pdf import PdfPages

import matplotlib.gridspec as gridspec


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


class SpacePredictionPDFExporter:
    """
    Export space prediction data to PDF format.
    Generates comprehensive reports with charts and tables matching Excel layout.
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
        """Export report data to PDF and return base64 encoded string."""
        if report is None:
            return None
        start_time = time.time()
        logger.info(f"Starting PDF generation for {name}")

        pdf_filename = self.generate_pdf(
            report, name,
            base_period_start_datetime_local,
            base_period_end_datetime_local,
            reporting_start_datetime_local,
            reporting_end_datetime_local,
            period_type,
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
        """Generate PDF file from report data."""
        _ = self._

        if "reporting_period" not in report.keys() or \
                "names" not in report['reporting_period'].keys() or \
                len(report['reporting_period']['names']) == 0:
            filename = str(uuid.uuid4()) + '.pdf'
            with PdfPages(filename) as pdf:
                self._create_cover_page(pdf, name, period_type,
                                        reporting_start_datetime_local,
                                        reporting_end_datetime_local,
                                        base_period_start_datetime_local,
                                        base_period_end_datetime_local,
                                        False)
            return filename

        filename = str(uuid.uuid4()) + '.pdf'

        self.report = _convert_decimals(report)
        self.name = name
        self.base_period_start = base_period_start_datetime_local
        self.base_period_end = base_period_end_datetime_local
        self.reporting_start = reporting_start_datetime_local
        self.reporting_end = reporting_end_datetime_local
        self.period_type = period_type

        self.is_base_period_exists = self._is_base_period_timestamp_exists(report['base_period'])

        with PdfPages(filename) as pdf:
            # Cover page
            self._create_cover_page(pdf, name, period_type,
                                    reporting_start_datetime_local,
                                    reporting_end_datetime_local,
                                    base_period_start_datetime_local,
                                    base_period_end_datetime_local,
                                    self.is_base_period_exists)

            # Combined analysis page
            self._create_combined_analysis_page(pdf)

            # Detailed data table pages
            self._create_detailed_data_page(pdf)

            # Separate line charts for each energy category
            self._create_detailed_data_charts(pdf)

            # Parameters
            self._create_parameters_page(pdf)

        logger.info(f"PDF generated: {filename}")
        return filename

    def _create_cover_page(self, pdf, name, period_type,
                           reporting_start, reporting_end,
                           base_period_start, base_period_end,
                           has_base_period):
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

        # Title
        fig.text(0.5, 0.50, _('Energy Prediction Analysis'),
                 fontsize=24, weight='bold', ha='center', va='center')

        # Info list
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

        for i in range(len(info_data)):
            for j in [0, 1]:
                table[i, j].set_edgecolor('white')
                table[i, j].set_linewidth(0)
            table[i, 0].set_text_props(ha='right')
            table[i, 1].get_text().set_ha('center')

        pdf.savefig(fig)
        plt.close()

    def _create_combined_analysis_page(self, pdf: PdfPages):
        """Create combined analysis page: Reporting Period Prediction table on top,
        Time-of-use + TCE/TCO2E breakdown on bottom.
        """
        _ = self._
        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        subtotals = reporting_data.get('subtotals', [])
        subtotals_per_unit_area = reporting_data.get('subtotals_per_unit_area', [])
        increment_rates = reporting_data.get('increment_rates', [])
        subtotals_in_kgce = reporting_data.get('subtotals_in_kgce', [])
        subtotals_in_kgco2e = reporting_data.get('subtotals_in_kgco2e', [])
        ca_len = len(names)

        # ===== Build Reporting Period Prediction table =====
        rp_col_headers = ['']
        for i in range(ca_len):
            rp_col_headers.append(names[i] + ' (' + units[i] + ')')
        rp_col_headers.append(_('Ton of Standard Coal') + ' (TCE)')
        rp_col_headers.append(_('Ton of Carbon Dioxide Emissions') + ' (TCO2E)')

        consumption_row = [_('Consumption')]
        for i in range(ca_len):
            consumption_row.append(str(round2(subtotals[i], 2)))
        consumption_row.append(str(round2(reporting_data.get('total_in_kgce', 0) / 1000, 2)))
        consumption_row.append(str(round2(reporting_data.get('total_in_kgco2e', 0) / 1000, 2)))

        per_area_row = [_('Per Unit Area')]
        for i in range(ca_len):
            val = subtotals_per_unit_area[i] if i < len(subtotals_per_unit_area) else None
            per_area_row.append(str(round2(val, 2)) if val is not None else '')
        kgce_per_area = reporting_data.get('total_in_kgce_per_unit_area', None)
        kgco2e_per_area = reporting_data.get('total_in_kgco2e_per_unit_area', None)
        per_area_row.append(str(round2(kgce_per_area / 1000, 2)) if kgce_per_area is not None else '')
        per_area_row.append(str(round2(kgco2e_per_area / 1000, 2)) if kgco2e_per_area is not None else '')

        increment_row = [_('Increment Rate')]
        for i in range(ca_len):
            val = increment_rates[i] if i < len(increment_rates) else None
            increment_row.append(str(round2(val * 100, 2)) + '%' if val is not None else '-')
        inc_kgce = reporting_data.get('increment_rate_in_kgce', None)
        inc_kgco2e = reporting_data.get('increment_rate_in_kgco2e', None)
        increment_row.append(str(round2(inc_kgce * 100, 2)) + '%' if inc_kgce is not None else '-')
        increment_row.append(str(round2(inc_kgco2e * 100, 2)) + '%' if inc_kgco2e is not None else '-')

        rp_table_data = [rp_col_headers, consumption_row, per_area_row, increment_row]

        # ===== Time-of-use electricity data =====
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
            deeps = reporting_data.get('deeps', [])
            tou_values = [
                round2(toppeaks[electricity_index], 2) if electricity_index < len(toppeaks) else 0,
                round2(onpeaks[electricity_index], 2) if electricity_index < len(onpeaks) else 0,
                round2(midpeaks[electricity_index], 2) if electricity_index < len(midpeaks) else 0,
                round2(offpeaks[electricity_index], 2) if electricity_index < len(offpeaks) else 0,
            ]

        # ===== TCE breakdown data =====
        kgce_sum = sum(subtotals_in_kgce) if subtotals_in_kgce else 0
        tce_table_data = [[_('Energy Category'), _('Ton of Standard Coal(TCE) by Energy Category')]]
        for i in range(ca_len):
            tce_val = round2(subtotals_in_kgce[i] / 1000, 3) if i < len(subtotals_in_kgce) else 0
            tce_table_data.append([names[i], str(tce_val)])

        # ===== TCO2E breakdown data =====
        kgco2e_sum = sum(subtotals_in_kgco2e) if subtotals_in_kgco2e else 0
        co2e_table_data = [[_('Energy Category'), _('Ton of Carbon Dioxide Emissions(TCO2E) by Energy Category') ]]
        for i in range(ca_len):
            co2e_val = round2(subtotals_in_kgco2e[i] / 1000, 3) if i < len(subtotals_in_kgco2e) else 0
            co2e_table_data.append([names[i], str(co2e_val)])

        # ===== Create figure =====
        fig = plt.figure(figsize=self.page_size)
        fig.suptitle(self.name + ' - ' + _('Reporting Period Consumption'),
                     fontsize=14, weight='bold', y=0.98)

        # Main layout: top = summary table, bottom = TOU + TCE/TCO2E
        gs_main = gridspec.GridSpec(2, 1, height_ratios=[0.28, 0.72], hspace=0.25)

        # ===== Top: Reporting Period Consumption table =====
        ax_rp = fig.add_subplot(gs_main[0])
        ax_rp.axis('off')

        rp_num_cols = len(rp_col_headers)
        rp_col_widths = [0.12] + [0.08] * (rp_num_cols - 1)
        rp_total_w = sum(rp_col_widths)
        rp_col_widths = [w / rp_total_w for w in rp_col_widths]

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

        # ===== Bottom: 3 columns (TOU + TCE + TCO2E) =====
        gs_bottom = gridspec.GridSpecFromSubplotSpec(
            2, 3, subplot_spec=gs_main[1],
            width_ratios=[0.30, 0.35, 0.35], height_ratios=[0.40, 0.60],
            hspace=0.20, wspace=0.15)

        # --- TOU table (bottom-left) ---
        ax_tou_tbl = fig.add_subplot(gs_bottom[0, 0])
        ax_tou_tbl.axis('off')
        tou_table_data = [
            [_('Energy Category'),_('Electricity Consumption by Time-Of-Use')],
            [_('TopPeak'), str(tou_values[0]) if tou_exists else ''],
            [_('OnPeak'), str(tou_values[1]) if tou_exists else ''],
            [_('MidPeak'), str(tou_values[2]) if tou_exists else ''],
            [_('OffPeak'), str(tou_values[3]) if tou_exists else ''],
        ]
        tbl_tou = ax_tou_tbl.table(cellText=tou_table_data, loc='center',
                                    cellLoc='center', colWidths=[0.4, 0.6])
        tbl_tou.auto_set_font_size(False)
        tbl_tou.set_fontsize(8)
        tbl_tou[0, 0].set_facecolor('#90EE90')
        tbl_tou[0, 0].set_text_props(weight='bold')
        tbl_tou[0, 1].set_facecolor('#90EE90')
        tbl_tou[0, 1].set_text_props(weight='bold')
        _style_table_borders(tbl_tou, len(tou_table_data), 2)

        # --- TOU pie chart ---
        ax_tou_pie = fig.add_subplot(gs_bottom[1, 0])
        if tou_exists:
            tou_filtered = [(n, v) for n, v in zip(tou_categories, tou_values) if v > 0]
            if tou_filtered:
                tou_fn, tou_fv = zip(*tou_filtered)
                tou_colors = ['#FF1744', '#FF6F00', '#FDD835', '#00BCD4', '#4CAF50']
                ax_tou_pie.pie(tou_fv, labels=tou_fn, autopct='%1.1f%%',
                               colors=tou_colors[:len(tou_fn)], startangle=90)
            ax_tou_pie.set_title(_('Electricity Consumption by Time-Of-Use'),
                                 fontsize=8, weight='bold')
        else:
            ax_tou_pie.text(0.5, 0.5, _('No data'), fontsize=12,
                            ha='center', va='center', transform=ax_tou_pie.transAxes)
            ax_tou_pie.axis('off')

        # --- TCE table (bottom-center) ---
        ax_tce_tbl = fig.add_subplot(gs_bottom[0, 1])
        ax_tce_tbl.axis('off')
        tbl_tce = ax_tce_tbl.table(cellText=tce_table_data, loc='center',
                                   cellLoc='center', colWidths=[0.35, 0.65])
        tbl_tce.auto_set_font_size(False)
        tbl_tce.set_fontsize(8)
        for j in range(2):
            tbl_tce[0, j].set_facecolor('#90EE90')
            tbl_tce[0, j].set_text_props(weight='bold')
        _style_table_borders(tbl_tce, len(tce_table_data), 2)

        # --- TCE pie chart ---
        ax_tce_pie = fig.add_subplot(gs_bottom[1, 1])
        tce_values = [round2(v / 1000, 3) for v in subtotals_in_kgce] if subtotals_in_kgce else []
        tce_filtered = [(n, v) for n, v in zip(names, tce_values) if v > 0]
        if tce_filtered:
            tce_fn, tce_fv = zip(*tce_filtered)
            tce_colors = self.colors['chart_colors'][:len(tce_fn)]
            ax_tce_pie.pie(tce_fv, labels=tce_fn, autopct='%1.1f%%',
                           colors=tce_colors, startangle=90)
        ax_tce_pie.set_title(self.name + ' ' + _('Ton of Standard Coal(TCE) by Energy Category'),
                             fontsize=8, weight='bold')

        # --- TCO2E table (bottom-right) ---
        ax_co2e_tbl = fig.add_subplot(gs_bottom[0, 2])
        ax_co2e_tbl.axis('off')
        tbl_co2e = ax_co2e_tbl.table(cellText=co2e_table_data, loc='center',
                                     cellLoc='center', colWidths=[0.35, 0.65])
        tbl_co2e.auto_set_font_size(False)
        tbl_co2e.set_fontsize(8)
        for j in range(2):
            tbl_co2e[0, j].set_facecolor('#90EE90')
            tbl_co2e[0, j].set_text_props(weight='bold')
        _style_table_borders(tbl_co2e, len(co2e_table_data), 2)

        # --- TCO2E pie chart ---
        ax_co2e_pie = fig.add_subplot(gs_bottom[1, 2])
        co2e_values = [round2(v / 1000, 3) for v in subtotals_in_kgco2e] if subtotals_in_kgco2e else []
        co2e_filtered = [(n, v) for n, v in zip(names, co2e_values) if v > 0]
        if co2e_filtered:
            co2e_fn, co2e_fv = zip(*co2e_filtered)
            co2e_colors = self.colors['chart_colors'][:len(co2e_fn)]
            ax_co2e_pie.pie(co2e_fv, labels=co2e_fn, autopct='%1.1f%%',
                            colors=co2e_colors, startangle=90)
        ax_co2e_pie.set_title(self.name + ' ' + _('Ton of Carbon Dioxide Emissions(TCO2E) by Energy Category'),
                              fontsize=8, weight='bold')

        pdf.savefig(fig)
        plt.close()

    def _create_detailed_data_page(self, pdf: PdfPages):
        """Create detailed data table pages matching Excel full data table."""
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

        rows_per_page = 100

        if not self.is_base_period_exists:
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

                subtotal_row = [_('Subtotal')]
                for i in range(ca_len):
                    subtotal_row.append(str(round2(subtotals[i], 2)) if i < len(subtotals) else '')
                table_data.append(subtotal_row)

                num_cols = len(col_headers)
                col_widths = [0.12] + [0.88 / ca_len] * ca_len
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

                pdf.savefig(fig)
                plt.close()

    def _create_detailed_data_charts(self, pdf: PdfPages):
        """Create separate line charts for each energy category."""
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
        charts_per_page = 4

        if not self.is_base_period_exists:
            num_pages = (num_categories + charts_per_page - 1) // charts_per_page

            for page in range(num_pages):
                start_idx = page * charts_per_page
                end_idx = min(start_idx + charts_per_page, num_categories)
                page_categories = list(range(start_idx, end_idx))
                n = len(page_categories)

                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + ' ' + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

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
                    ax_chart.set_title(_('Reporting Period Consumption') + ' - ' +
                                       names[i] + ' (' + units[i] + ')',
                                       fontsize=9, weight='bold')
                    ax_chart.grid(True, alpha=0.3)

                pdf.savefig(fig)
                plt.close()
        else:
            base_period_data = self.report['base_period']
            base_timestamps = base_period_data.get('timestamps', [])
            base_values = base_period_data.get('values', [])
            base_names = base_period_data.get('names', [])

            num_pages = (num_categories + charts_per_page - 1) // charts_per_page

            for page in range(num_pages):
                start_idx = page * charts_per_page
                end_idx = min(start_idx + charts_per_page, num_categories)
                page_categories = list(range(start_idx, end_idx))
                n = len(page_categories)

                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + ' ' + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

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

                    r_data = values[i] if i < len(values) else []
                    color = self.colors['chart_colors'][i % len(self.colors['chart_colors'])]
                    ax_chart.plot(range(len(r_data)), r_data, linewidth=1.2,
                                  color=color, marker='o', markersize=3,
                                  markevery=max(1, len(r_data) // 30),
                                  label=_('Reporting Period') + ' - ' + names[i])

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
                        _('Base Period Consumption') + ' / ' +
                        _('Reporting Period Consumption') + ' - ' +
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

        all_zero = True
        for ts_list in timestamps:
            if ts_list and len(ts_list) > 0:
                all_zero = False
                break
        if all_zero:
            return

        batch_size = 4
        rows_per_param = 25
        num_batches = (len(param_names) + batch_size - 1) // batch_size

        for batch in range(num_batches):
            batch_start = batch * batch_size
            batch_end = min(batch_start + batch_size, len(param_names))
            batch_params = list(range(batch_start, batch_end))

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

                safe_data = []
                for v in data:
                    if v is None:
                        safe_data.append('')
                    else:
                        try:
                            safe_data.append(str(round2(v, 2)))
                        except (TypeError, ValueError):
                            safe_data.append('')

                ax_tbl = fig.add_subplot(gs[idx, 0])
                ax_tbl.axis('off')
                tbl_rows = min(rows_per_param, data_len)
                tbl_data = [[_('Time'), name]]
                for j in range(tbl_rows):
                    tbl_data.append([times[j], safe_data[j]])
                tbl = ax_tbl.table(cellText=tbl_data, loc='upper center',
                                   cellLoc='center', colWidths=[0.5, 0.5])
                tbl.auto_set_font_size(False)
                tbl.set_fontsize(5)
                tbl[0, 0].set_facecolor('#90EE90')
                tbl[0, 0].set_text_props(weight='bold')
                tbl[0, 1].set_facecolor('#90EE90')
                tbl[0, 1].set_text_props(weight='bold')
                _style_table_borders(tbl, len(tbl_data), 2)

                ax_chart = fig.add_subplot(gs[idx, 1])
                xs, ys = self._filter_valid_data(data)
                if ys:
                    marker_step_p = max(1, len(ys) // 20)
                    ax_chart.plot(xs, ys, linewidth=1.2,
                                  color='#5B9BD5', marker='o', markersize=3,
                                  markevery=marker_step_p, label=name)
                    ax_chart.fill_between(xs, ys, alpha=0.15, color='#5B9BD5')
                step = max(1, data_len // 8)
                ax_chart.set_xticks(range(0, data_len, step))
                ax_chart.set_xticklabels([times[t][:10] for t in range(0, data_len, step)],
                                         rotation=45, ha='right', fontsize=6)
                ax_chart.set_ylabel(name, fontsize=8)
                ax_chart.set_title(name, fontsize=9, weight='bold')
                ax_chart.grid(True, alpha=0.3)

            pdf.savefig(fig)
            plt.close()

    @staticmethod
    def _filter_valid_data(data):
        """Filter out None/NaN values, returning (valid_x_indices, valid_y_values) lists."""
        xs, ys = [], []
        for idx, v in enumerate(data):
            if v is not None:
                try:
                    ys.append(float(v))
                    xs.append(idx)
                except (TypeError, ValueError):
                    pass
        return xs, ys

    def _is_base_period_timestamp_exists(self, base_period_data):
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
    exporter = SpacePredictionPDFExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
