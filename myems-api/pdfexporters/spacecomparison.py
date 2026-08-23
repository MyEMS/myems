"""
Space Comparison PDF Exporter

This module provides functionality to export space comparison data to PDF format.
It generates comprehensive reports showing energy consumption comparison between
two spaces with detailed breakdown including difference analysis.

Key Features:
- Space energy comparison analysis (two spaces, single energy category)
- Consumption summary for both spaces
- Detailed data table with difference column
- Comparison line chart (both spaces overlaid)
- Parameter data pages (if available)
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Cover page with report metadata (Space Comparison Analysis)
- Combined analysis page (consumption summary + comparison chart)
- Detailed data pages (paginated table + line chart)
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


class SpaceComparisonPDFExporter:
    """
    Export space comparison data to PDF format.
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
               space1_name: str,
               space2_name: str,
               energy_category_name: str,
               reporting_start_datetime_local: str,
               reporting_end_datetime_local: str,
               period_type: str,
               language: str) -> Optional[str]:
        """Export report data to PDF and return base64 encoded string."""
        if report is None:
            return None
        start_time = time.time()
        logger.info(f"Starting PDF generation for SpaceComparison: {space1_name} vs {space2_name}")

        pdf_filename = self.generate_pdf(
            report, space1_name, space2_name, energy_category_name,
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
        logger.info(f"PDF generation completed in {elapsed:.2f}s for SpaceComparison")
        return result

    def generate_pdf(self,
                     report: Dict[str, Any],
                     space1_name: str,
                     space2_name: str,
                     energy_category_name: str,
                     reporting_start_datetime_local: str,
                     reporting_end_datetime_local: str,
                     period_type: str,
                     language: str) -> Optional[str]:
        """Generate PDF file from report data."""
        _ = self._

        if "reporting_period1" not in report.keys() or \
                "values" not in report['reporting_period1'].keys() or \
                len(report['reporting_period1']['values']) == 0:
            filename = str(uuid.uuid4()) + '.pdf'
            with PdfPages(filename) as pdf:
                self._create_cover_page(pdf, space1_name, space2_name,
                                        energy_category_name,
                                        reporting_start_datetime_local,
                                        reporting_end_datetime_local,
                                        period_type)
            return filename

        filename = str(uuid.uuid4()) + '.pdf'

        self.report = _convert_decimals(report)
        self.space1_name = space1_name
        self.space2_name = space2_name
        self.energy_category_name = energy_category_name
        self.reporting_start = reporting_start_datetime_local
        self.reporting_end = reporting_end_datetime_local
        self.period_type = period_type
        self.unit = report['energy_category']['unit_of_measure']

        with PdfPages(filename) as pdf:
            # Cover page
            self._create_cover_page(pdf, space1_name, space2_name,
                                    energy_category_name,
                                    reporting_start_datetime_local,
                                    reporting_end_datetime_local,
                                    period_type)

            # Combined analysis page (summary + chart)
            self._create_combined_analysis_page(pdf)

            # Detailed data table pages
            self._create_detailed_data_page(pdf)

            # Parameters
            self._create_parameters_page(pdf)

        logger.info(f"PDF generated: {filename}")
        return filename

    def _create_cover_page(self, pdf, space1_name, space2_name,
                           energy_category_name,
                           reporting_start, reporting_end,
                           period_type):
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
        fig.text(0.5, 0.50, _('Space Comparison Analysis'),
                 fontsize=24, weight='bold', ha='center', va='center')

        # Info list
        info_data = [
            [_('Space') + '1:', space1_name],
            [_('Space') + '2:', space2_name],
            [_('Energy Category') + ':', energy_category_name],
            [_('Period Type') + ':', period_type],
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

    def _create_combined_analysis_page(self, pdf: PdfPages):
        """Create combined analysis page: Consumption summary on top, comparison chart on bottom."""
        _ = self._
        reporting_data1 = self.report['reporting_period1']
        reporting_data2 = self.report['reporting_period2']
        diff_data = self.report['diff']

        total1 = round2(reporting_data1.get('total_in_category', 0), 2)
        total2 = round2(reporting_data2.get('total_in_category', 0), 2)
        total_diff = round2(diff_data.get('total_in_category', 0), 2)

        unit = self.unit
        cat_name = self.energy_category_name

        # ===== Create figure =====
        fig = plt.figure(figsize=self.page_size)
        fig.suptitle(self.space1_name + ' & ' + self.space2_name + ' - ' +
                     _('Reporting Period Consumption'),
                     fontsize=14, weight='bold', y=0.98)

        # Main layout: top = summary table, bottom = comparison chart
        gs_main = gridspec.GridSpec(2, 1, height_ratios=[0.25, 0.75], hspace=0.25)

        # ===== Top: Consumption summary table =====
        ax_summary = fig.add_subplot(gs_main[0])
        ax_summary.axis('off')

        summary_data = [
            ['', cat_name + ' (' + unit + ')'],
            [self.space1_name, str(total1)],
            [self.space2_name, str(total2)],
            [_('Difference'), str(total_diff)],
        ]

        tbl_summary = ax_summary.table(cellText=summary_data, loc='center',
                                       cellLoc='center', colWidths=[0.3, 0.3])
        tbl_summary.auto_set_font_size(False)
        tbl_summary.set_fontsize(9)
        for j in range(2):
            tbl_summary[0, j].set_facecolor('#90EE90')
            tbl_summary[0, j].set_text_props(weight='bold')
        for i in range(1, len(summary_data)):
            tbl_summary[i, 0].set_facecolor('#90EE90')
            tbl_summary[i, 0].set_text_props(weight='bold')
        _style_table_borders(tbl_summary, len(summary_data), 2)

        # ===== Bottom: Comparison line chart =====
        ax_chart = fig.add_subplot(gs_main[1])
        timestamps1 = reporting_data1.get('timestamps', [])
        values1 = reporting_data1.get('values', [])
        values2 = reporting_data2.get('values', [])

        if timestamps1 and len(timestamps1) > 0:
            # Sanitize values for plotting
            xs = list(range(len(timestamps1)))
            ys1 = self._sanitize_values(values1)
            ys2 = self._sanitize_values(values2)

            ax_chart.plot(xs, ys1, linewidth=1.5, color='#4472C4',
                          marker='o', markersize=3,
                          markevery=max(1, len(xs) // 30),
                          label=self.space1_name)
            ax_chart.plot(xs, ys2, linewidth=1.5, color='#ED7D31',
                          marker='s', markersize=3,
                          markevery=max(1, len(xs) // 30),
                          label=self.space2_name)

            # X-axis labels
            step = max(1, len(timestamps1) // 10)
            ax_chart.set_xticks(range(0, len(timestamps1), step))
            ax_chart.set_xticklabels(
                [timestamps1[t][:10] for t in range(0, len(timestamps1), step)],
                rotation=45, ha='right', fontsize=7)

            ax_chart.set_ylabel(cat_name + ' (' + unit + ')', fontsize=9)
            ax_chart.legend(fontsize=9)
            ax_chart.grid(True, alpha=0.3)

        pdf.savefig(fig)
        plt.close()

    def _create_detailed_data_page(self, pdf: PdfPages):
        """Create detailed data table pages matching Excel full data table."""
        _ = self._

        reporting_data1 = self.report['reporting_period1']
        reporting_data2 = self.report['reporting_period2']
        diff_data = self.report['diff']

        timestamps = reporting_data1.get('timestamps', [])
        values1 = reporting_data1.get('values', [])
        values2 = reporting_data2.get('values', [])
        diff_values = diff_data.get('values', [])

        if not timestamps or len(timestamps) == 0:
            return

        unit = self.unit
        cat_name = self.energy_category_name
        rows_per_page = 100

        num_pages = (len(timestamps) + rows_per_page - 1) // rows_per_page

        for page in range(num_pages):
            start_row = page * rows_per_page
            end_row = min(start_row + rows_per_page, len(timestamps))

            fig = plt.figure(figsize=self.page_size)
            fig.suptitle(self.space1_name + ' and ' + self.space2_name + ' ' +
                         _('Detailed Data'),
                         fontsize=14, weight='bold', y=0.98)

            gs = gridspec.GridSpec(1, 1)
            ax_table = fig.add_subplot(gs[0])
            ax_table.axis('off')

            col_headers = [
                _('Datetime'),
                self.space1_name + ' ' + cat_name + ' (' + unit + ')',
                self.space2_name + ' ' + cat_name + ' (' + unit + ')',
                _('Difference')
            ]

            table_data = [col_headers]
            for t_idx in range(start_row, end_row):
                row = [timestamps[t_idx]]
                v1 = round2(values1[t_idx], 2) if t_idx < len(values1) and values1[t_idx] is not None else ''
                v2 = round2(values2[t_idx], 2) if t_idx < len(values2) and values2[t_idx] is not None else ''
                vd = round2(diff_values[t_idx], 2) if t_idx < len(diff_values) and diff_values[t_idx] is not None else ''
                row.append(str(v1))
                row.append(str(v2))
                row.append(str(vd))
                table_data.append(row)

            # Total row
            total1 = round2(reporting_data1.get('total_in_category', 0), 2)
            total2 = round2(reporting_data2.get('total_in_category', 0), 2)
            total_diff = round2(diff_data.get('total_in_category', 0), 2)
            table_data.append([_('Total'), str(total1), str(total2), str(total_diff)])

            num_cols = len(col_headers)
            col_widths = [0.20, 0.27, 0.27, 0.26]
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

    def _create_parameters_page(self, pdf: PdfPages):
        """Create parameters pages for both space1 and space2."""
        _ = self._

        for param_key, space_name in [('parameters1', self.space1_name),
                                       ('parameters2', self.space2_name)]:
            params = self.report.get(param_key, {})
            if not params or not params.get('names') or not params.get('timestamps'):
                continue

            param_names = params.get('names', [])
            timestamps = params.get('timestamps', [])
            values = params.get('values', [])

            all_zero = True
            for ts_list in timestamps:
                if ts_list and len(ts_list) > 0:
                    all_zero = False
                    break
            if all_zero:
                continue

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
                fig.suptitle(space_name + ' ' + _('Parameters') +
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

    @staticmethod
    def _sanitize_values(values):
        """Convert values list for plotting, replacing None with NaN."""
        result = []
        for v in values:
            if v is None:
                result.append(float('nan'))
            else:
                try:
                    result.append(float(v))
                except (TypeError, ValueError):
                    result.append(float('nan'))
        return result


# Convenience function for backward compatibility
def export(report, space1_name, space2_name, energy_category_name,
           reporting_start_datetime_local, reporting_end_datetime_local,
           period_type, language):
    """
    Export report data to PDF and return base64 encoded string.
    This function maintains the same interface as the Excel exporter.
    """
    exporter = SpaceComparisonPDFExporter(language)
    return exporter.export(report, space1_name, space2_name, energy_category_name,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type, language)
