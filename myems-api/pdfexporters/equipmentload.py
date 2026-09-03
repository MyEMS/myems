"""
Equipment Load PDF Exporter

This module provides functionality to export equipment load data to PDF format.
It generates comprehensive reports showing load analysis for equipment
with detailed breakdown by energy categories and time periods.

Key Features:
- Equipment load analysis (average load, maximum load, load factor)
- Base period vs reporting period comparison
- Load breakdown by energy categories
- Detailed data with line charts
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Cover page with report metadata
- Combined analysis page (reporting period load summary tables)
- Detailed data charts (paginated, average and maximum per category)
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


class EquipmentLoadPDFExporter:
    """
    Export equipment load data to PDF format.
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

        # Title - 'Load' translates to '负荷分析' in zh_CN
        fig.text(0.5, 0.50, _('Load'),
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
        Columns: Reporting Period | Average Load | Maximum Load | Load Factor
        Each energy category gets 2 rows: value row + increment rate row.
        """
        _ = self._
        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        averages = reporting_data.get('averages', [])
        averages_increment_rate = reporting_data.get('averages_increment_rate', [])
        maximums = reporting_data.get('maximums', [])
        maximums_increment_rate = reporting_data.get('maximums_increment_rate', [])
        factors = reporting_data.get('factors', [])
        factors_increment_rate = reporting_data.get('factors_increment_rate', [])
        ca_len = len(names)

        fig = plt.figure(figsize=self.page_size)
        fig.suptitle(self.name + ' ' + _('Statistics'),
                     fontsize=16, weight='bold', y=0.98)

        # Build single combined table data matching Excel layout
        # Header row
        header = [_('Reporting Period'), _('Average Load'),
                  _('Maximum Load'), _('Load Factor')]
        table_data = [header]

        # Data rows: each category gets 2 rows (value + increment rate)
        for i in range(ca_len):
            # Value row
            cat_name = names[i] + ' (' + units[i] + '/H)'
            avg_val = averages[i] if averages and i < len(averages) else None
            max_val = maximums[i] if maximums and i < len(maximums) else None
            fac_val = factors[i] if factors and i < len(factors) else None
            table_data.append([
                cat_name,
                str(round2(avg_val, 2)) if avg_val is not None else '',
                str(round2(max_val, 2)) if max_val is not None else '',
                str(round2(fac_val, 2)) if fac_val is not None else ''
            ])

            # Increment rate row
            avg_inc = averages_increment_rate[i] if averages_increment_rate and i < len(averages_increment_rate) else None
            max_inc = maximums_increment_rate[i] if maximums_increment_rate and i < len(maximums_increment_rate) else None
            fac_inc = factors_increment_rate[i] if factors_increment_rate and i < len(factors_increment_rate) else None
            table_data.append([
                _('Increment Rate'),
                str(round2(avg_inc * 100, 2)) + '%' if avg_inc is not None else '-',
                str(round2(max_inc * 100, 2)) + '%' if max_inc is not None else '-',
                str(round2(fac_inc * 100, 2)) + '%' if fac_inc is not None else '-'
            ])

        num_rows = len(table_data)
        num_cols = 4
        col_widths = [0.30, 0.24, 0.24, 0.22]

        ax = fig.add_axes([0.05, 0.05, 0.90, 0.85])
        ax.axis('off')

        tbl = ax.table(cellText=table_data, loc='center',
                       cellLoc='center', colWidths=col_widths)
        tbl.auto_set_font_size(False)
        tbl.set_fontsize(9)

        # Style header row (green)
        for j in range(num_cols):
            tbl[0, j].set_facecolor('#90EE90')
            tbl[0, j].set_text_props(weight='bold')

        # Style first column of data rows (green)
        for i in range(1, num_rows):
            tbl[i, 0].set_facecolor('#90EE90')
            tbl[i, 0].set_text_props(weight='bold')

        _style_table_borders(tbl, num_rows, num_cols)

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

    def _create_detailed_data_charts(self, pdf: PdfPages):
        """Create line charts for each energy category showing average load and maximum load.
        Each energy category gets 2 charts (average + maximum), displayed vertically.
        Matches Excel layout which generates both average and maximum charts per category.
        """
        _ = self._

        reporting_data = self.report['reporting_period']
        timestamps = reporting_data.get('timestamps', [])
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        sub_averages = reporting_data.get('sub_averages', [])
        sub_maximums = reporting_data.get('sub_maximums', [])

        if not timestamps or len(timestamps[0]) == 0 or not names:
            return

        reporting_times = timestamps[0]
        num_categories = len(names)

        has_sub_averages = len(sub_averages) > 0
        has_sub_maximums = len(sub_maximums) > 0

        # Number of chart rows per energy category
        charts_per_category = 0
        if has_sub_averages:
            charts_per_category += 1
        if has_sub_maximums:
            charts_per_category += 1

        if not self.is_base_period_exists:
            for i in range(num_categories):
                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + ' ' + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

                gs = gridspec.GridSpec(charts_per_category, 1, hspace=0.35)
                chart_row = 0

                # Average Load chart
                if has_sub_averages:
                    ax_avg = fig.add_subplot(gs[chart_row])
                    raw_data = sub_averages[i] if i < len(sub_averages) else []
                    xs, ys = self._filter_valid_data(raw_data)
                    color = self.colors['chart_colors'][i % len(self.colors['chart_colors'])]
                    if ys:
                        ax_avg.plot(xs, ys, linewidth=1.2, color=color,
                                    marker='o', markersize=3,
                                    markevery=max(1, len(ys) // 30))

                    step = max(1, len(raw_data) // 10)
                    ax_avg.set_xticks(range(0, len(raw_data), step))
                    ax_avg.set_xticklabels(
                        [reporting_times[t][:10] for t in range(0, len(raw_data), step)],
                        rotation=45, ha='right', fontsize=7)
                    ax_avg.set_title(_('Reporting Period Average Load') + ' - ' +
                                     names[i] + ' ' + _('Average Load') +
                                     ' (' + units[i] + '/H)',
                                     fontsize=9, weight='bold')
                    ax_avg.grid(True, alpha=0.3)
                    chart_row += 1

                # Maximum Load chart
                if has_sub_maximums:
                    ax_max = fig.add_subplot(gs[chart_row])
                    raw_data = sub_maximums[i] if i < len(sub_maximums) else []
                    xs, ys = self._filter_valid_data(raw_data)
                    color = self.colors['chart_colors'][i % len(self.colors['chart_colors'])]
                    if ys:
                        ax_max.plot(xs, ys, linewidth=1.2, color=color,
                                    marker='o', markersize=3,
                                    markevery=max(1, len(ys) // 30))

                    step = max(1, len(raw_data) // 10)
                    ax_max.set_xticks(range(0, len(raw_data), step))
                    ax_max.set_xticklabels(
                        [reporting_times[t][:10] for t in range(0, len(raw_data), step)],
                        rotation=45, ha='right', fontsize=7)
                    ax_max.set_title(_('Reporting Period Maximum Load') + ' - ' +
                                     names[i] + ' ' + _('Maximum Load') +
                                     ' (' + units[i] + '/H)',
                                     fontsize=9, weight='bold')
                    ax_max.grid(True, alpha=0.3)

                pdf.savefig(fig)
                plt.close()
        else:
            base_period_data = self.report['base_period']
            base_sub_averages = base_period_data.get('sub_averages', [])
            base_sub_maximums = base_period_data.get('sub_maximums', [])

            for i in range(num_categories):
                fig = plt.figure(figsize=self.page_size)
                fig.suptitle(self.name + ' ' + _('Detailed Data'),
                             fontsize=16, weight='bold', y=0.98)

                gs = gridspec.GridSpec(charts_per_category, 1, hspace=0.35)
                chart_row = 0

                # Average Load chart (base period vs reporting period)
                if has_sub_averages:
                    ax_avg = fig.add_subplot(gs[chart_row])

                    # Reporting period line
                    r_data = sub_averages[i] if i < len(sub_averages) else []
                    r_xs, r_ys = self._filter_valid_data(r_data)
                    color = self.colors['chart_colors'][i % len(self.colors['chart_colors'])]
                    if r_ys:
                        ax_avg.plot(r_xs, r_ys, linewidth=1.2, color=color,
                                    marker='o', markersize=3,
                                    markevery=max(1, len(r_ys) // 30),
                                    label=_('Reporting Period') + ' - ' + names[i])

                    # Base period line (dashed)
                    if i < len(base_sub_averages):
                        b_data = base_sub_averages[i]
                        b_xs, b_ys = self._filter_valid_data(b_data)
                        if b_ys:
                            ax_avg.plot(b_xs, b_ys, linewidth=1.2, color=color,
                                        linestyle='--', marker='s', markersize=3,
                                        markevery=max(1, len(b_ys) // 30),
                                        label=_('Base Period') + ' - ' + names[i])

                    step = max(1, len(r_data) // 10)
                    ax_avg.set_xticks(range(0, len(r_data), step))
                    ax_avg.set_xticklabels(
                        [reporting_times[t][:10] if t < len(reporting_times) else ''
                         for t in range(0, len(r_data), step)],
                        rotation=45, ha='right', fontsize=7)
                    ax_avg.set_title(
                        _('Base Period Average Load') + ' / ' +
                        _('Reporting Period Average Load') + ' - ' +
                        names[i] + ' ' + _('Average Load') +
                        ' (' + units[i] + '/H)',
                        fontsize=8, weight='bold')
                    ax_avg.legend(fontsize=7)
                    ax_avg.grid(True, alpha=0.3)
                    chart_row += 1

                # Maximum Load chart (base period vs reporting period)
                if has_sub_maximums:
                    ax_max = fig.add_subplot(gs[chart_row])

                    # Reporting period line
                    r_data = sub_maximums[i] if i < len(sub_maximums) else []
                    r_xs, r_ys = self._filter_valid_data(r_data)
                    color = self.colors['chart_colors'][i % len(self.colors['chart_colors'])]
                    if r_ys:
                        ax_max.plot(r_xs, r_ys, linewidth=1.2, color=color,
                                    marker='o', markersize=3,
                                    markevery=max(1, len(r_ys) // 30),
                                    label=_('Reporting Period') + ' - ' + names[i])

                    # Base period line (dashed)
                    if i < len(base_sub_maximums):
                        b_data = base_sub_maximums[i]
                        b_xs, b_ys = self._filter_valid_data(b_data)
                        if b_ys:
                            ax_max.plot(b_xs, b_ys, linewidth=1.2, color=color,
                                        linestyle='--', marker='s', markersize=3,
                                        markevery=max(1, len(b_ys) // 30),
                                        label=_('Base Period') + ' - ' + names[i])

                    step = max(1, len(r_data) // 10)
                    ax_max.set_xticks(range(0, len(r_data), step))
                    ax_max.set_xticklabels(
                        [reporting_times[t][:10] if t < len(reporting_times) else ''
                         for t in range(0, len(r_data), step)],
                        rotation=45, ha='right', fontsize=7)
                    ax_max.set_title(
                        _('Base Period Maximum Load') + ' / ' +
                        _('Reporting Period Maximum Load') + ' - ' +
                        names[i] + ' ' + _('Maximum Load') +
                        ' (' + units[i] + '/H)',
                        fontsize=8, weight='bold')
                    ax_max.legend(fontsize=7)
                    ax_max.grid(True, alpha=0.3)

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

        # Batch 4 parameters per page
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

                # Line chart
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
    exporter = EquipmentLoadPDFExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
