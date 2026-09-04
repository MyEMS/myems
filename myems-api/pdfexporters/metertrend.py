"""
Meter Trend PDF Exporter

This module provides functionality to export meter trend data to PDF format.
It generates comprehensive reports showing multi-series point trends for meters
with detailed data tables and line charts.

Key Features:
- Meter associated point trend analysis (multi-series)
- Detailed multi-series data table with combined line chart
- Parameter data (if available)
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Cover page with meter and reporting period info
- Trend data table (Datetime + one column per point) with a line chart
- Parameter data (if available)

Note: unlike the energy/carbon/cost exporters, the trend report has no base
period and no consumption summary; its reporting_period holds multiple series
(names/timestamps/values are lists of lists, one per associated point).
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


def timestamps_data_all_equal_0(lists):
    """Check if all parameters timestamp lists are empty."""
    for i, value in enumerate(list(lists)):
        if len(value) > 0:
            return False

    return True


class MeterTrendPDFExporter:
    """
    Export meter trend data to PDF format.
    Generates comprehensive reports with multi-series tables and charts
    matching the Excel layout.
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
            'chart_colors': ['#4472C4', '#ED7D31', '#70AD47', '#FFC000', '#5B9BD5',
                             '#A855F7', '#EC4899', '#14B8A6', '#F97316', '#6366F1']
        }

    def export(self,
               report: Dict[str, Any],
               name: str,
               reporting_start_datetime_local: str,
               reporting_end_datetime_local: str,
               period_type: str,
               language: str) -> Optional[str]:
        """
        Export report data to PDF and return base64 encoded string.
        Keeps the same interface as the Excel exporter (period_type is unused,
        the trend report has no period type in its header, matching Excel).
        """
        if report is None:
            return None

        start_time = time.time()
        logger.info(f"Starting PDF generation for {name}")
        # Generate PDF file
        pdf_filename = self.generate_pdf(
            report, name,
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
        self.period_type = period_type

        meter = self.report.get('meter', {})
        self.energy_category_name = meter.get('energy_category_name', '')
        self.unit_of_measure = meter.get('unit_of_measure', '')

        # Generate PDF
        with PdfPages(filename) as pdf:
            # Cover page
            self._create_cover_page(pdf, name,
                                    reporting_start_datetime_local,
                                    reporting_end_datetime_local)

            # Multi-series trend data table and combined line chart
            self._create_trend_pages(pdf)

            # Parameters tables and line charts
            self._create_parameters_pages(pdf)

        logger.info(f"PDF generated: {filename}")
        return filename

    def _create_cover_page(self, pdf: PdfPages, name: str,
                           reporting_start: str, reporting_end: str):
        """Create cover page with logo, centered title, and borderless info list.

        The trend report has no period type and no base period, so only the
        meter name and the reporting period datetimes are shown (matches Excel).
        """
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
        fig.text(0.5, 0.50, _('Meter Data') + ' - ' + _('Meter Trend'),
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

        # Remove all borders, style labels and values
        for i in range(len(info_data)):
            for j in [0, 1]:
                table[i, j].set_edgecolor('white')
                table[i, j].set_linewidth(0)
            table[i, 0].set_text_props(ha='right')
            table[i, 1].get_text().set_ha('center')

        pdf.savefig(fig)
        plt.close()

    def _create_trend_pages(self, pdf: PdfPages):
        """Create trend pages: a multi-series table (Datetime + one column per
        associated point) on top and a combined line chart on the bottom.

        Mirrors the Excel trend block, whose table header is
        [Datetime, names[0], names[1], ...] and whose values are rounded to 3
        decimals. Excel picks the first non-empty timestamps list as the shared
        datetime axis; the same logic is applied here.
        """
        _ = self._

        reporting_data = self.report.get('reporting_period', {})
        names = reporting_data.get('names', [])
        timestamps = reporting_data.get('timestamps', [])
        values = reporting_data.get('values', [])

        if names is None or len(names) == 0:
            return

        ca_len = len(names)

        # Excel uses the first non-empty timestamps list as the datetime axis
        time_axis = []
        for ts_list in timestamps:
            if ts_list is not None and len(ts_list) > 0:
                time_axis = ts_list
                break
        if len(time_axis) == 0:
            return

        num_rows = len(time_axis)
        rows_per_page = 30  # 50 rows overflow the page and clip rows, see doc 3.5
        num_pages = (num_rows + rows_per_page - 1) // rows_per_page
        marker_step = max(1, rows_per_page // 15)

        # Column headers: Datetime + one column per point (matches Excel)
        col_headers = [_('Datetime')] + [str(names[i]) for i in range(ca_len)]
        num_cols = len(col_headers)

        # Dynamic column widths: datetime column wider, series share the rest
        datetime_w = 0.22
        series_w = (1.0 - datetime_w) / ca_len
        col_widths = [datetime_w] + [series_w] * ca_len

        # Font size adapts to the number of columns
        if num_cols <= 5:
            fontsize = 7
        elif num_cols <= 9:
            fontsize = 6
        else:
            fontsize = 5

        nan = float('nan')

        for page in range(num_pages):
            start_row = page * rows_per_page
            end_row = min(start_row + rows_per_page, num_rows)
            page_len = end_row - start_row

            fig = plt.figure(figsize=self.page_size)
            fig.suptitle(self.name + ' ' + _('Trend'),
                         fontsize=16, weight='bold', y=0.98)

            # Fixed axes instead of GridSpec: the table is pinned to its box via
            # bbox so that all rows stay inside the page.
            ax_table = fig.add_axes([0.06, 0.42, 0.88, 0.50])
            ax_table.axis('off')

            # Build table rows; values rounded to 3 decimals (matches Excel)
            table_data = [col_headers]
            for j in range(start_row, end_row):
                row = [str(time_axis[j])]
                for i in range(ca_len):
                    cell = ''
                    if i < len(values) and values[i] is not None and \
                            j < len(values[i]) and values[i][j] is not None:
                        cell = str(round2(values[i][j], 3))
                    row.append(cell)
                table_data.append(row)

            table = ax_table.table(cellText=table_data, loc='center',
                                   cellLoc='center', colWidths=col_widths,
                                   bbox=[0, 0, 1, 1])
            table.auto_set_font_size(False)
            table.set_fontsize(fontsize)

            # Header row is green (matches Excel)
            for j in range(num_cols):
                table[0, j].set_facecolor(self.colors['table_header'])
                table[0, j].set_text_props(weight='bold')
            _style_table_borders(table, len(table_data), num_cols)

            # Combined multi-series line chart of the current page
            ax_chart = fig.add_axes([0.08, 0.11, 0.84, 0.26])
            for i in range(ca_len):
                series_vals = []
                for j in range(start_row, end_row):
                    if i < len(values) and values[i] is not None and \
                            j < len(values[i]) and values[i][j] is not None:
                        series_vals.append(float(values[i][j]))
                    else:
                        series_vals.append(nan)
                color = self.colors['chart_colors'][i % len(self.colors['chart_colors'])]
                ax_chart.plot(range(page_len), series_vals, linewidth=1.2,
                              color=color, marker='o', markersize=2.5,
                              markevery=marker_step, label=str(names[i]))

            step = max(1, page_len // 8)
            ax_chart.set_xticks(range(0, page_len, step))
            ax_chart.set_xticklabels([str(time_axis[start_row + t])
                                      for t in range(0, page_len, step)],
                                     rotation=45, ha='right', fontsize=7)
            ax_chart.set_title(_('Trend'), fontsize=10, weight='bold')
            legend_ncol = 1 if ca_len <= 4 else 2
            ax_chart.legend(fontsize=6, loc='best', ncol=legend_ncol, framealpha=0.6)
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
def export(report, name, reporting_start_datetime_local, reporting_end_datetime_local,
           period_type, language):
    """
    Export report data to PDF and return base64 encoded string.
    This function maintains the same interface as the Excel exporter.
    """
    exporter = MeterTrendPDFExporter(language)
    return exporter.export(report, name,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
