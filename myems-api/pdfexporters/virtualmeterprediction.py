"""
Virtual Meter Prediction PDF Exporter

This module provides functionality to export virtual meter prediction data to PDF format.
It generates comprehensive reports showing energy prediction analysis for virtual meters
with detailed breakdown and time-series data.

Key Features:
- Meter energy prediction analysis
- Base period vs reporting period comparison
- Detailed data with line charts
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Meter prediction summary
- Base period comparison data
- Detailed time-series data with line charts
- Parameter data (if available)
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


def is_base_period_timestamp_exists(base_period_data):
    """Check if base period timestamp exists."""
    timestamps = base_period_data['timestamps']

    if len(timestamps) == 0:
        return False

    for timestamp in timestamps:
        if len(timestamp) > 0:
            return True

    return False


def timestamps_data_all_equal_0(lists):
    """Check if all parameters timestamp lists are empty."""
    for i, value in enumerate(list(lists)):
        if len(value) > 0:
            return False

    return True


class VirtualMeterPredictionPDFExporter:
    """
    Export virtual meter prediction data to PDF format.
    Generates comprehensive reports with charts and tables matching Excel layout.
    """

    def __init__(self, language: str = 'zh_CN'):
        """
        Initialize the PDF exporter.

        Args:
            language: Language code ('zh_CN', 'en', etc.)
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
            'table_header': '#90EE90',
            'table_total': '#E8EDF5',
            'chart_colors': ['#4472C4', '#ED7D31', '#70AD47', '#FFC000', '#5B9BD5']
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
        # Generate unique filename
        filename = str(uuid.uuid4()) + '.pdf'

        # Prepare data for PDF generation
        self.report = _convert_decimals(report)
        self.name = name
        self.reporting_start = reporting_start_datetime_local
        self.reporting_end = reporting_end_datetime_local
        self.base_period_start = base_period_start_datetime_local
        self.base_period_end = base_period_end_datetime_local
        self.period_type = period_type

        self.energy_category_name = self.report['virtual_meter']['energy_category_name']
        self.unit_of_measure = self.report['virtual_meter']['unit_of_measure']

        # Check if base period exists
        self.is_base_period_exists = \
            is_base_period_timestamp_exists(self.report['base_period']) \
            if 'base_period' in self.report.keys() else False

        # Same empty-data condition as the Excel exporter: when there is no
        # prediction value, Excel still produces a header-only file, so the PDF
        # produces a cover-only file (do not add, do not remove content).
        has_prediction_data = \
            "reporting_period" in self.report.keys() and \
            "values" in self.report['reporting_period'].keys() and \
            len(self.report['reporting_period']['values']) > 0

        # Generate PDF
        with PdfPages(filename) as pdf:
            # Cover page (always generated, matches the Excel header block)
            self._create_cover_page(pdf, name, period_type,
                                    reporting_start_datetime_local,
                                    reporting_end_datetime_local,
                                    base_period_start_datetime_local,
                                    base_period_end_datetime_local,
                                    self.is_base_period_exists)

            if has_prediction_data:
                # Reporting period prediction summary table
                self._create_prediction_page(pdf)

                # Detailed data table and line chart
                self._create_detailed_data_pages(pdf)

                # Parameters tables and line charts
                self._create_parameters_pages(pdf)

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
        fig.text(0.5, 0.50, _('Meter Data') + ' - ' + _('Virtual Meter Prediction'),
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

    def _create_prediction_page(self, pdf: PdfPages):
        """Create the reporting period prediction summary page.

        Mirrors the Excel block at rows 7~9: a header row (meter name, energy
        category, TCE, TCO2E) plus the Prediction row and the Increment Rate row.
        """
        _ = self._
        reporting_data = self.report['reporting_period']

        increment_rate = reporting_data.get('increment_rate', None)
        increment_rate_text = str(round2(increment_rate * 100, 2)) + "%" \
            if increment_rate is not None else "-"

        col_headers = [
            # Excel B7 carries the meter name inside the green header row
            self.name,
            self.energy_category_name + " (" + self.unit_of_measure + ")",
            _('Ton of Standard Coal') + '(TCE)',
            _('Ton of Carbon Dioxide Emissions') + '(TCO2E)'
        ]
        prediction_row = [
            _('Prediction'),
            str(round2(reporting_data['total_in_category'], 2)),
            str(round2(reporting_data['total_in_kgce'] / 1000, 2)),
            str(round2(reporting_data['total_in_kgco2e'] / 1000, 2))
        ]
        increment_row = [_('Increment Rate'), increment_rate_text, increment_rate_text, increment_rate_text]

        table_data = [col_headers, prediction_row, increment_row]

        fig = plt.figure(figsize=self.page_size)
        fig.suptitle(self.name + ' ' + _('Prediction'),
                     fontsize=16, weight='bold', y=0.98)

        ax_table = fig.add_axes([0.08, 0.42, 0.84, 0.22])
        ax_table.axis('off')

        num_cols = len(col_headers)
        table = ax_table.table(cellText=table_data, loc='center',
                               cellLoc='center', colWidths=[0.16, 0.28, 0.28, 0.28])
        table.auto_set_font_size(False)
        table.set_fontsize(9)

        # Header row is green (matches Excel row 7)
        for j in range(num_cols):
            table[0, j].set_facecolor(self.colors['table_header'])
            table[0, j].set_text_props(weight='bold')
        # Row labels are bold but not filled (matches Excel B8/B9)
        for i in range(1, len(table_data)):
            table[i, 0].set_text_props(weight='bold')
        _style_table_borders(table, len(table_data), num_cols)

        pdf.savefig(fig)
        plt.close()

    def _create_detailed_data_pages(self, pdf: PdfPages):
        """Create detailed data pages matching the Excel data table and line chart."""
        _ = self._

        reporting_data = self.report['reporting_period']
        reporting_times = reporting_data.get('timestamps', [])
        reporting_values = reporting_data.get('values', [])

        if len(reporting_times) == 0 and not self.is_base_period_exists:
            return

        category_label = self.energy_category_name + " (" + self.unit_of_measure + ")"
        chart_title = _('Reporting Period Prediction') + ' - ' + category_label

        rows_per_page = 30  # 50 rows overflow the page and clip rows, see doc 3.5

        if not self.is_base_period_exists:
            if len(reporting_times) == 0:
                return
            num_pages = (len(reporting_times) + rows_per_page - 1) // rows_per_page
            marker_step = max(1, rows_per_page // 15)

            for page in range(num_pages):
                start_row = page * rows_per_page
                end_row = min(start_row + rows_per_page, len(reporting_times))

                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

                ax_table = fig.add_axes([0.06, 0.42, 0.88, 0.50])
                ax_table.axis('off')

                col_headers = [_('Datetime'), category_label]
                table_data = [col_headers]
                for t_idx in range(start_row, end_row):
                    table_data.append([reporting_times[t_idx],
                                       str(round2(reporting_values[t_idx], 2))])

                # Total row: the Excel table holds a single Total row at the very end
                # of the data, so it is appended on the last page only.
                has_total_row = end_row == len(reporting_times)
                if has_total_row:
                    table_data.append([_('Total'),
                                       str(round2(reporting_data['total_in_category'], 2))])

                num_cols = len(col_headers)
                table = ax_table.table(cellText=table_data, loc='center',
                                       cellLoc='center', colWidths=[0.5, 0.5],
                                       bbox=[0, 0, 1, 1])
                table.auto_set_font_size(False)
                table.set_fontsize(7)

                for j in range(num_cols):
                    table[0, j].set_facecolor(self.colors['table_header'])
                    table[0, j].set_text_props(weight='bold')
                if has_total_row:
                    last_row = len(table_data) - 1
                    for j in range(num_cols):
                        table[last_row, j].set_facecolor(self.colors['table_total'])
                        table[last_row, j].set_text_props(weight='bold')
                _style_table_borders(table, len(table_data), num_cols)

                # Line chart of the current page
                ax_chart = fig.add_axes([0.08, 0.11, 0.84, 0.26])
                page_data = reporting_values[start_row:end_row]
                ax_chart.plot(range(len(page_data)), page_data, linewidth=1.2,
                              color=self.colors['chart_colors'][0],
                              marker='o', markersize=3, markevery=marker_step,
                              label=category_label)
                step = max(1, (end_row - start_row) // 8)
                ax_chart.set_xticks(range(0, end_row - start_row, step))
                ax_chart.set_xticklabels([reporting_times[start_row + t]
                                          for t in range(0, end_row - start_row, step)],
                                         rotation=45, ha='right', fontsize=7)
                ax_chart.set_title(chart_title, fontsize=10, weight='bold')
                ax_chart.legend(fontsize=7, loc='upper right')
                ax_chart.grid(True, alpha=0.3)

                pdf.savefig(fig)
                plt.close()
        else:
            base_period_data = self.report['base_period']
            base_times = base_period_data.get('timestamps', [])
            base_values = base_period_data.get('values', [])

            # The Excel exporter uses the same chart title in both branches
            total_rows = max(len(reporting_times), len(base_times))
            if total_rows == 0:
                return
            num_pages = (total_rows + rows_per_page - 1) // rows_per_page
            marker_step = max(1, rows_per_page // 15)

            for page in range(num_pages):
                start_row = page * rows_per_page
                end_row = min(start_row + rows_per_page, total_rows)

                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

                ax_table = fig.add_axes([0.06, 0.42, 0.88, 0.50])
                ax_table.axis('off')

                col_headers = [
                    _('Base Period') + ' - ' + _('Datetime'),
                    _('Base Period') + ' - ' + category_label,
                    _('Reporting Period') + ' - ' + _('Datetime'),
                    _('Reporting Period') + ' - ' + category_label
                ]
                table_data = [col_headers]
                for t_idx in range(start_row, end_row):
                    base_time = base_times[t_idx] if t_idx < len(base_times) else ''
                    base_value = str(round2(base_values[t_idx], 2)) \
                        if t_idx < len(base_values) else ''
                    rep_time = reporting_times[t_idx] if t_idx < len(reporting_times) else ''
                    rep_value = str(round2(reporting_values[t_idx], 2)) \
                        if t_idx < len(reporting_values) else ''
                    table_data.append([base_time, base_value, rep_time, rep_value])

                # Total row: appended on the last page only, as in the Excel table
                has_total_row = end_row == total_rows
                if has_total_row:
                    table_data.append([_('Total'),
                                       str(round2(base_period_data['total_in_category'], 2)),
                                       _('Total'),
                                       str(round2(reporting_data['total_in_category'], 2))])

                num_cols = len(col_headers)
                table = ax_table.table(cellText=table_data, loc='center',
                                       cellLoc='center', colWidths=[0.25] * num_cols,
                                       bbox=[0, 0, 1, 1])
                table.auto_set_font_size(False)
                table.set_fontsize(6)

                for j in range(num_cols):
                    table[0, j].set_facecolor(self.colors['table_header'])
                    table[0, j].set_text_props(weight='bold')
                if has_total_row:
                    last_row = len(table_data) - 1
                    for j in range(num_cols):
                        table[last_row, j].set_facecolor(self.colors['table_total'])
                        table[last_row, j].set_text_props(weight='bold')
                _style_table_borders(table, len(table_data), num_cols)

                # Line chart of the current page, base period and reporting period
                # overlaid. The Excel exporter adds the base period series first and
                # the reporting period series second, so the legend order follows it.
                ax_chart = fig.add_axes([0.08, 0.11, 0.84, 0.26])
                base_page_data = base_values[start_row:min(end_row, len(base_values))]
                ax_chart.plot(range(len(base_page_data)), base_page_data, linewidth=1.2,
                              color=self.colors['chart_colors'][1], linestyle='--',
                              marker='s', markersize=3, markevery=marker_step,
                              label=_('Base Period') + ' - ' + category_label)
                page_data = reporting_values[start_row:min(end_row, len(reporting_values))]
                ax_chart.plot(range(len(page_data)), page_data, linewidth=1.2,
                              color=self.colors['chart_colors'][0],
                              marker='o', markersize=3, markevery=marker_step,
                              label=_('Reporting Period') + ' - ' + category_label)
                page_len = end_row - start_row
                step = max(1, page_len // 8)
                tick_positions = []
                tick_labels = []
                for t in range(0, page_len, step):
                    idx = start_row + t
                    if idx < len(reporting_times):
                        tick_positions.append(t)
                        tick_labels.append(reporting_times[idx])
                ax_chart.set_xticks(tick_positions)
                ax_chart.set_xticklabels(tick_labels, rotation=45, ha='right', fontsize=7)
                ax_chart.set_title(chart_title, fontsize=10, weight='bold')
                ax_chart.legend(fontsize=7, loc='upper right')
                ax_chart.grid(True, alpha=0.3)

                pdf.savefig(fig)
                plt.close()

    def _create_parameters_pages(self, pdf: PdfPages):
        """Create parameters pages: batch 4 parameters per page with compact table and chart."""
        _ = self._

        params = self.report.get('parameters', {})
        if 'names' not in params.keys() or \
                params['names'] is None or \
                len(params['names']) == 0 or \
                'timestamps' not in params.keys() or \
                params['timestamps'] is None or \
                len(params['timestamps']) == 0 or \
                'values' not in params.keys() or \
                params['values'] is None or \
                len(params['values']) == 0 or \
                timestamps_data_all_equal_0(params['timestamps']):
            return

        param_names = params['names']
        timestamps = params['timestamps']
        values = params['values']

        # Batch 4 parameters per page
        batch_size = 4
        rows_per_param = 12  # a quarter-page slot holds about 12 readable rows
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
            fig.suptitle(self.name + ' ' + _('Parameters'),
                         fontsize=16, weight='bold', y=0.98)

            gs = gridspec.GridSpec(len(valid_params), 2, width_ratios=[0.35, 0.65],
                                   hspace=0.50)

            for idx, pi in enumerate(valid_params):
                param_name = param_names[pi]
                times = timestamps[pi]
                data = values[pi]
                data_len = len(times)

                # Compact table (first 12 rows)
                ax_tbl = fig.add_subplot(gs[idx, 0])
                ax_tbl.axis('off')
                tbl_rows = min(rows_per_param, data_len)
                tbl_data = [[_('Datetime'), param_name]]
                for j in range(tbl_rows):
                    tbl_data.append([times[j], str(round2(data[j], 2))])
                tbl = ax_tbl.table(cellText=tbl_data, loc='upper center',
                                   cellLoc='center', colWidths=[0.5, 0.5],
                                   bbox=[0, 0, 1, 1])
                tbl.auto_set_font_size(False)
                tbl.set_fontsize(5)
                tbl[0, 0].set_facecolor(self.colors['table_header'])
                tbl[0, 0].set_text_props(weight='bold')
                tbl[0, 1].set_facecolor(self.colors['table_header'])
                tbl[0, 1].set_text_props(weight='bold')
                _style_table_borders(tbl, len(tbl_data), 2)

                # Line chart
                ax_chart = fig.add_subplot(gs[idx, 1])
                marker_step_p = max(1, data_len // 20)
                ax_chart.plot(range(data_len), data, linewidth=1.2,
                              color='#5B9BD5', marker='o', markersize=3,
                              markevery=marker_step_p, label=param_name)
                ax_chart.fill_between(range(data_len), data, alpha=0.15, color='#5B9BD5')
                step = max(1, data_len // 8)
                ax_chart.set_xticks(range(0, data_len, step))
                ax_chart.set_xticklabels([str(times[t])[5:16].replace('T', ' ')
                                          for t in range(0, data_len, step)],
                                         rotation=45, ha='right', fontsize=5)
                ax_chart.set_ylabel(param_name, fontsize=8)
                ax_chart.set_title(_('Parameters') + ' - ' + param_name,
                                   fontsize=9, weight='bold')
                ax_chart.grid(True, alpha=0.3)

            pdf.savefig(fig)
            plt.close()


# Convenience function keeping the same interface as the Excel exporter
def export(report, name, base_period_start_datetime_local, base_period_end_datetime_local,
           reporting_start_datetime_local, reporting_end_datetime_local,
           period_type, language):
    """
    Export report data to PDF and return base64 encoded string.
    This function maintains the same interface as the Excel exporter.
    """
    exporter = VirtualMeterPredictionPDFExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
