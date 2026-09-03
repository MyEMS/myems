"""
Equipment Statistics PDF Exporter

This module provides functionality to export equipment statistics data to PDF format.
It generates comprehensive reports showing statistical analysis for equipment
with detailed breakdown by energy categories and time periods.

Key Features:
- Equipment statistical analysis
- Base period vs reporting period comparison
- Statistics breakdown by energy categories
- Detailed data with line charts
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Cover page with report metadata
- Combined analysis page (statistics table matching Excel layout)
- Detailed data charts (paginated, up to 4 per page in 2x2 grid)
- Parameter data pages (batched 4 per page)
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


class EquipmentStatisticsPDFExporter:
    """
    Export equipment statistics data to PDF format.
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

        self.is_base_period_exists = self._is_base_period_timestamp_exists(report.get('base_period', {}))

        with PdfPages(filename) as pdf:
            # Cover page
            self._create_cover_page(pdf, name, period_type,
                                    reporting_start_datetime_local,
                                    reporting_end_datetime_local,
                                    base_period_start_datetime_local,
                                    base_period_end_datetime_local,
                                    self.is_base_period_exists)

            # Combined analysis page (statistics table matching Excel layout)
            self._create_combined_analysis_page(pdf)

            # Separate line charts for each energy category (paginated)
            self._create_detailed_data_charts(pdf)

            # Parameters (batched)
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

        # Title - _('Statistics') translates to "统计分析" in zh_CN
        fig.text(0.5, 0.50, _('Statistics'),
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
        """Create combined analysis page with ONE table matching Excel layout.
        Columns: Reporting Period | Arithmetic Mean | Median | Minimum | Maximum | Stdev | Variance
        Each energy category gets 2 rows: value row + increment rate row.
        """
        _ = self._
        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        means = reporting_data.get('means', [])
        means_increment_rate = reporting_data.get('means_increment_rate', [])
        medians = reporting_data.get('medians', [])
        medians_increment_rate = reporting_data.get('medians_increment_rate', [])
        minimums = reporting_data.get('minimums', [])
        minimums_increment_rate = reporting_data.get('minimums_increment_rate', [])
        maximums = reporting_data.get('maximums', [])
        maximums_increment_rate = reporting_data.get('maximums_increment_rate', [])
        stdevs = reporting_data.get('stdevs', [])
        stdevs_increment_rate = reporting_data.get('stdevs_increment_rate', [])
        variances = reporting_data.get('variances', [])
        variances_increment_rate = reporting_data.get('variances_increment_rate', [])
        ca_len = len(names)

        # Build table data
        col_headers = [
            _('Reporting Period'),
            _('Arithmetic Mean'),
            _('Median (Middle Value)'),
            _('Minimum Value'),
            _('Maximum Value'),
            _('Sample Standard Deviation'),
            _('Sample Variance')
        ]

        table_data = [col_headers]

        for i in range(ca_len):
            # Value row
            value_row = [
                names[i] + ' (' + units[i] + ')',
                str(round2(means[i], 2)) if means[i] is not None else '',
                str(round2(medians[i], 2)) if medians[i] is not None else '',
                str(round2(minimums[i], 2)) if minimums[i] is not None else '',
                str(round2(maximums[i], 2)) if maximums[i] is not None else '',
                str(round2(stdevs[i], 2)) if stdevs[i] is not None else '',
                str(round2(variances[i], 2)) if variances[i] is not None else ''
            ]
            table_data.append(value_row)

            # Increment rate row
            def fmt_rate(rate_list, idx):
                val = rate_list[idx] if idx < len(rate_list) else None
                return str(round2(val * 100, 2)) + '%' if val is not None else '-'

            increment_row = [
                _('Increment Rate'),
                fmt_rate(means_increment_rate, i),
                fmt_rate(medians_increment_rate, i),
                fmt_rate(minimums_increment_rate, i),
                fmt_rate(maximums_increment_rate, i),
                fmt_rate(stdevs_increment_rate, i),
                fmt_rate(variances_increment_rate, i)
            ]
            table_data.append(increment_row)

        num_rows = len(table_data)
        num_cols = len(col_headers)

        fig = plt.figure(figsize=self.page_size)
        fig.suptitle(self.name + ' ' + _('Statistics'),
                     fontsize=16, weight='bold', y=0.98)

        gs = gridspec.GridSpec(1, 1)
        ax_tbl = fig.add_subplot(gs[0])
        ax_tbl.axis('off')

        # Column widths: first col wider, rest equal
        col_widths = [0.20] + [0.133] * (num_cols - 1)
        total_w = sum(col_widths)
        col_widths = [w / total_w for w in col_widths]

        tbl = ax_tbl.table(cellText=table_data, loc='center',
                            cellLoc='center', colWidths=col_widths)
        tbl.auto_set_font_size(False)
        tbl.set_fontsize(7)

        # Style header row
        for j in range(num_cols):
            tbl[0, j].set_facecolor('#90EE90')
            tbl[0, j].set_text_props(weight='bold')

        # Style first column (category names and increment rate labels)
        for i in range(1, num_rows):
            tbl[i, 0].set_facecolor('#90EE90')
            tbl[i, 0].set_text_props(weight='bold')

        # Alternate row colors for value rows (not increment rate rows)
        value_row_idx = 0
        for i in range(1, num_rows):
            if i % 2 == 1:  # value row
                for j in range(1, num_cols):
                    if value_row_idx % 2 == 1:
                        tbl[i, j].set_facecolor('#E8EDF5')
                value_row_idx += 1

        _style_table_borders(tbl, num_rows, num_cols)

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
                    ax_chart.set_title(_('Reporting Period Consumption') + ' - ' +
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
                        _('Base Period Consumption') + ' / ' +
                        _('Reporting Period Consumption') + ' - ' +
                        names[i] + ' (' + units[i] + ')',
                        fontsize=8, weight='bold')
                    ax_chart.legend(fontsize=7)
                    ax_chart.grid(True, alpha=0.3)

                pdf.savefig(fig)
                plt.close()

    def _create_parameters_page(self, pdf):
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
    exporter = EquipmentStatisticsPDFExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
