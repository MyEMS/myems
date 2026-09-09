"""
Power Quality PDF Exporter

This module provides functionality to export power quality data to PDF format.
It generates comprehensive reports showing multi-series point trends for meters
plus the power quality analysis table (voltage/current/frequency compliance).

Key Features:
- Power quality trend table (Datetime + one column per point) with line chart
- Power quality analysis table (Point/Category/Type/Unit/Limit/Normal Limit/
  Severe Limit/Compliance/Worst Deviation/Worst Time + dynamic metrics)
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Cover page with meter and reporting period info
- Trend pages (paginated table + combined line chart)
- Analysis pages (paginated table, only when report['analysis'] is non-empty)

Note: the content mirrors the Excel exporter (excelexporters/powerquality.py)
exactly - the same columns, the same rows, the same 3-decimal precision for
trend values and raw values for the analysis table. The Excel output has no
parameters block, therefore this exporter has no parameters page either.
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


class PowerQualityPDFExporter:
    """
    Export power quality data to PDF format.
    Generates a multi-series trend table with a combined line chart plus the
    power quality analysis table, matching the Excel exporter layout.
    """

    def __init__(self, language: str = 'zh_CN'):
        font_setup_success = setup_chinese_fonts()
        if not font_setup_success:
            logger.warning("Chinese font setup failed, some text may not display correctly")

        self.language = language
        self.trans = get_translation(language)
        # Do NOT call self.trans.install() - it modifies global builtins._
        # which causes language cross-contamination in concurrent requests.
        self._ = self.trans.gettext

        # Page settings - A4 landscape
        self.page_size = (11.69, 8.27)
        self.dpi = 80

        # Color scheme
        self.colors = {
            'table_header': '#90EE90',
            'chart_colors': ['#4472C4', '#ED7D31', '#70AD47', '#FFC000', '#5B9BD5',
                             '#A855F7', '#EC4899', '#14B8A6', '#F97316', '#6366F1'],
        }

    def export(self,
               report: Dict[str, Any],
               name: str,
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
                     reporting_start_datetime_local: str,
                     reporting_end_datetime_local: str,
                     period_type: str,
                     language: str) -> Optional[str]:
        """Generate PDF file from report data."""
        filename = str(uuid.uuid4()) + '.pdf'

        self.report = _convert_decimals(report)
        self.name = name
        self.reporting_start = reporting_start_datetime_local
        self.reporting_end = reporting_end_datetime_local

        with PdfPages(filename) as pdf:
            # Cover page
            self._create_cover_page(pdf)

            # Trend pages (Datetime + one column per point, with line chart)
            self._create_trend_pages(pdf)

            # Analysis pages (only when the report carries analysis items)
            self._create_analysis_pages(pdf)

        logger.info(f"PDF generated: {filename}")
        return filename

    def _create_cover_page(self, pdf):
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

        # Title - _('Power Quality Data') + ' - ' + _('Power Quality Analysis')
        fig.text(0.5, 0.50, _('Power Quality Data') + ' - ' + _('Power Quality Analysis'),
                 fontsize=24, weight='bold', ha='center', va='center')

        # Info list (mirrors the Excel query-parameter block)
        info_data = [
            [_('Name') + ':', self.name],
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

    def _create_trend_pages(self, pdf):
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
        rows_per_page = 30  # 50 rows overflow the page and clip rows, see guide 3.5
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

    def _create_analysis_pages(self, pdf):
        """Create analysis pages: the power quality analysis table (one row per
        analysis item) mirroring the Excel 'Power Quality Analysis' sheet:
        [Point, Category, Type, Unit, Limit, Normal Limit, Severe Limit,
         Compliance, Worst Deviation, Worst Time] + dynamic metric columns.
        Table-only pages, paginated; values written raw like Excel.
        """
        _ = self._

        analysis = self.report.get('analysis')
        if not isinstance(analysis, list) or len(analysis) == 0:
            return

        # Dynamic metric columns (sorted for a deterministic column order)
        metrics_names = []
        for item in analysis:
            if isinstance(item.get('metrics'), list):
                for m in item['metrics']:
                    if m.get('name') not in metrics_names:
                        metrics_names.append(m.get('name'))
        metrics_names = sorted(metrics_names)

        col_headers = [
            _('Point'), _('Category'), _('Type'), _('Unit'),
            _('Limit'), _('Normal Limit'), _('Severe Limit'), _('Compliance'),
            _('Worst Deviation'), _('Worst Time'),
        ] + metrics_names
        num_cols = len(col_headers)

        # Build all rows exactly like the Excel sheet
        all_rows = []
        for item in analysis:
            row_values = [
                item.get('point_name', ''),
                item.get('category', ''),
                item.get('type', ''),
                item.get('unit', ''),
                item.get('limit_pct', ''),
                item.get('limit_normal_hz', ''),
                item.get('limit_severe_hz', ''),
                item.get('compliance_pct', ''),
                item.get('worst_abs_deviation_pct',
                         item.get('worst_unbalance_pct', item.get('worst_deviation_hz', ''))),
                item.get('worst_time', ''),
            ]
            metrics_map = {}
            if isinstance(item.get('metrics'), list):
                for m in item['metrics']:
                    metrics_map[m.get('name')] = m.get('value')
            for mn in metrics_names:
                row_values.append(metrics_map.get(mn, ''))
            all_rows.append(['' if v is None else str(v) for v in row_values])

        num_rows = len(all_rows)
        rows_per_page = 30  # table-only page, see guide 3.5
        num_pages = (num_rows + rows_per_page - 1) // rows_per_page

        # Column widths: point name and worst time get the largest shares
        weights = [1.4, 0.8, 1.0, 0.5, 0.6, 0.7, 0.7, 0.8, 0.9, 1.2] + [0.9] * len(metrics_names)
        total_w = sum(weights)
        col_widths = [w / total_w for w in weights]

        # Font size adapts to the number of columns
        font_size = max(4, min(8, 80 // num_cols))

        for page in range(num_pages):
            start_idx = page * rows_per_page
            end_idx = min(start_idx + rows_per_page, num_rows)

            fig = plt.figure(figsize=self.page_size)
            if num_pages == 1:
                fig.suptitle(self.name + ' ' + _('Power Quality Analysis'),
                             fontsize=16, weight='bold', y=0.98)
            else:
                fig.suptitle(self.name + ' ' + _('Power Quality Analysis') +
                             ' (' + str(page + 1) + '/' + str(num_pages) + ')',
                             fontsize=16, weight='bold', y=0.98)

            ax = fig.add_axes([0.02, 0.05, 0.96, 0.88])
            ax.axis('off')

            table_data = [col_headers] + all_rows[start_idx:end_idx]
            tbl = ax.table(cellText=table_data, loc='center',
                           cellLoc='center', colWidths=col_widths)
            tbl.auto_set_font_size(False)
            tbl.set_fontsize(font_size)

            # Header row is green (matches Excel)
            for j in range(num_cols):
                tbl[0, j].set_facecolor(self.colors['table_header'])
                tbl[0, j].set_text_props(weight='bold')
            _style_table_borders(tbl, len(table_data), num_cols)

            pdf.savefig(fig)
            plt.close()


# Convenience function keeping the same interface as the Excel exporter
def export(report, name, reporting_start_datetime_local, reporting_end_datetime_local,
           period_type, language):
    """
    Export report data to PDF and return base64 encoded string.
    This function maintains the same interface as the Excel exporter.
    """
    exporter = PowerQualityPDFExporter(language)
    return exporter.export(report, name, reporting_start_datetime_local,
                           reporting_end_datetime_local, period_type, language)
