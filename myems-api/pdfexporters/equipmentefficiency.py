"""
Equipment Efficiency PDF Exporter

This module provides functionality to export equipment efficiency data to PDF format.
It generates comprehensive reports showing efficiency analysis for equipment
with detailed breakdown by energy categories and time periods.

Key Features:
- Equipment efficiency analysis
- Base period vs reporting period comparison
- Efficiency breakdown by energy categories
- Detailed data with line charts
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Cover page with report metadata
- Combined analysis page (reporting period cumulative efficiency table)
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


class EquipmentEfficiencyPDFExporter:
    """
    Export equipment efficiency data to PDF format.
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

        if "reporting_period_efficiency" not in report.keys() or \
                "names" not in report['reporting_period_efficiency'].keys() or \
                len(report['reporting_period_efficiency']['names']) == 0:
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

        base_data = report.get('base_period_efficiency', {})
        self.is_base_period_exists = self._is_base_period_timestamp_exists(base_data)

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

        # Title
        fig.text(0.5, 0.50, _('Equipment Data') + ' - ' +_('Efficiency'),
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
        """Create combined analysis page: Reporting Period Cumulative Efficiency table (matching Excel).
        Each fraction has 3 columns: efficiency, numerator, denominator.
        """
        _ = self._
        reporting_data = self.report['reporting_period_efficiency']
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        numerator_names = reporting_data.get('numerator_names', [])
        numerator_units = reporting_data.get('numerator_units', [])
        denominator_names = reporting_data.get('denominator_names', [])
        denominator_units = reporting_data.get('denominator_units', [])
        cumulations = reporting_data.get('cumulations', [])
        numerator_cumulations = reporting_data.get('numerator_cumulation', [])
        denominator_cumulations = reporting_data.get('denominator_cumulation', [])
        increment_rates = reporting_data.get('increment_rates', [])
        increment_rates_num = reporting_data.get('increment_rates_num', [])
        increment_rates_den = reporting_data.get('increment_rates_den', [])
        ca_len = len(names)

        # --- Build table data matching Excel layout: 3 columns per fraction ---
        rp_col_headers = ['']
        for i in range(ca_len):
            rp_col_headers.append(names[i] + ' (' + units[i] + ')')
            rp_col_headers.append(numerator_names[i] + ' (' + numerator_units[i] + ')')
            rp_col_headers.append(denominator_names[i] + ' (' + denominator_units[i] + ')')

        rp_cumulation_row = [_('Cumulative Efficiency')]
        for i in range(ca_len):
            val = cumulations[i] if i < len(cumulations) else None
            rp_cumulation_row.append(str(round2(val, 2)) if val is not None else '')
            val_num = numerator_cumulations[i] if i < len(numerator_cumulations) else None
            rp_cumulation_row.append(str(round2(val_num, 2)) if val_num is not None else '')
            val_den = denominator_cumulations[i] if i < len(denominator_cumulations) else None
            rp_cumulation_row.append(str(round2(val_den, 2)) if val_den is not None else '')

        rp_increment_row = [_('Increment Rate')]
        for i in range(ca_len):
            val = increment_rates[i] if i < len(increment_rates) else None
            rp_increment_row.append(str(round2(val * 100, 2)) + '%' if val is not None else '-')
            val_num = increment_rates_num[i] if i < len(increment_rates_num) else None
            rp_increment_row.append(str(round2(val_num * 100, 2)) + '%' if val_num is not None else '-')
            val_den = increment_rates_den[i] if i < len(increment_rates_den) else None
            rp_increment_row.append(str(round2(val_den * 100, 2)) + '%' if val_den is not None else '-')

        rp_table_data = [rp_col_headers, rp_cumulation_row, rp_increment_row]

        fig = plt.figure(figsize=self.page_size)
        fig.suptitle(self.name + ' - ' + _('Reporting Period Cumulative Efficiency'),
                     fontsize=16, weight='bold', y=0.98)

        ax_rp = fig.add_axes([0.02, 0.10, 0.96, 0.80])
        ax_rp.axis('off')

        rp_num_cols = len(rp_col_headers)
        total_cols = ca_len * 3
        rp_col_widths = [0.10] + [0.90 / total_cols] * total_cols
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
        """Create separate line charts for each fraction (value, numerator, denominator),
        matching Excel behavior. 3 charts per fraction, paginated max 4 per page (2x2 grid).
        """
        _ = self._

        reporting_data = self.report['reporting_period_efficiency']
        timestamps = reporting_data.get('timestamps', [])
        names = reporting_data.get('names', [])
        units = reporting_data.get('units', [])
        values = reporting_data.get('values', [])
        numerator_names = reporting_data.get('numerator_names', [])
        numerator_units = reporting_data.get('numerator_units', [])
        numerator_values = reporting_data.get('numerator_values', [])
        denominator_names = reporting_data.get('denominator_names', [])
        denominator_units = reporting_data.get('denominator_units', [])
        denominator_values = reporting_data.get('denominator_values', [])

        if not timestamps or len(timestamps[0]) == 0 or not names:
            return

        reporting_times = timestamps[0]
        num_categories = len(names)
        charts_per_page = 4  # 2x2 grid

        # Build flat list of all charts: 3 per fraction (value, numerator, denominator)
        all_charts = []
        for i in range(num_categories):
            all_charts.append({
                'data': values[i] if i < len(values) else [],
                'title': names[i] + ' (' + units[i] + ')',
                'color_idx': i
            })
            all_charts.append({
                'data': numerator_values[i] if i < len(numerator_values) else [],
                'title': numerator_names[i] + ' (' + numerator_units[i] + ')',
                'color_idx': i
            })
            all_charts.append({
                'data': denominator_values[i] if i < len(denominator_values) else [],
                'title': denominator_names[i] + ' (' + denominator_units[i] + ')',
                'color_idx': i
            })

        if not self.is_base_period_exists:
            total_charts = len(all_charts)
            num_pages = (total_charts + charts_per_page - 1) // charts_per_page

            for page in range(num_pages):
                start_idx = page * charts_per_page
                end_idx = min(start_idx + charts_per_page, total_charts)
                page_charts = all_charts[start_idx:end_idx]
                n = len(page_charts)

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

                for idx, chart_info in enumerate(page_charts):
                    try:
                        ax_chart = axes[idx]
                        raw_data = chart_info['data']
                        xs, ys = self._filter_valid_data(raw_data)
                        color = self.colors['chart_colors'][chart_info['color_idx'] % len(self.colors['chart_colors'])]
                        if len(xs) > 0:
                            ax_chart.plot(xs, ys, linewidth=1.2,
                                          color=color, marker='o', markersize=3,
                                          markevery=max(1, len(xs) // 30))

                        data_len = len(raw_data)
                        step = max(1, data_len // 10)
                        ax_chart.set_xticks(range(0, data_len, step))
                        ax_chart.set_xticklabels(
                            [reporting_times[t][:10] for t in range(0, data_len, step)],
                            rotation=45, ha='right', fontsize=7)
                        ax_chart.set_title(_('Reporting Period Cumulative Efficiency') + ' - ' +
                                           chart_info['title'],
                                           fontsize=9, weight='bold')
                        ax_chart.grid(True, alpha=0.3)
                    except Exception as e:
                        logger.error(f"Error plotting chart: {e}")

                pdf.savefig(fig)
                plt.close()
        else:
            base_period_data = self.report['base_period_efficiency']
            base_values = base_period_data.get('values', [])
            base_numerator_values = base_period_data.get('numerator_values', [])
            base_denominator_values = base_period_data.get('denominator_values', [])

            # Build base period chart data list matching all_charts order
            base_chart_data = []
            for i in range(num_categories):
                base_chart_data.append(base_values[i] if i < len(base_values) else [])
                base_chart_data.append(base_numerator_values[i] if i < len(base_numerator_values) else [])
                base_chart_data.append(base_denominator_values[i] if i < len(base_denominator_values) else [])

            total_charts = len(all_charts)
            num_pages = (total_charts + charts_per_page - 1) // charts_per_page

            for page in range(num_pages):
                start_idx = page * charts_per_page
                end_idx = min(start_idx + charts_per_page, total_charts)
                page_charts = all_charts[start_idx:end_idx]
                n = len(page_charts)

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

                for idx, chart_info in enumerate(page_charts):
                    try:
                        ax_chart = axes[idx]
                        chart_global_idx = start_idx + idx

                        # Reporting period line
                        r_raw = chart_info['data']
                        r_xs, r_ys = self._filter_valid_data(r_raw)
                        color = self.colors['chart_colors'][chart_info['color_idx'] % len(self.colors['chart_colors'])]
                        if len(r_xs) > 0:
                            ax_chart.plot(r_xs, r_ys, linewidth=1.2,
                                          color=color, marker='o', markersize=3,
                                          markevery=max(1, len(r_xs) // 30),
                                          label=_('Reporting Period') + ' - ' + chart_info['title'])

                        # Base period line (dashed)
                        if chart_global_idx < len(base_chart_data):
                            b_raw = base_chart_data[chart_global_idx]
                            b_xs, b_ys = self._filter_valid_data(b_raw)
                            if len(b_xs) > 0:
                                ax_chart.plot(b_xs, b_ys, linewidth=1.2,
                                              color=color, linestyle='--', marker='s', markersize=3,
                                              markevery=max(1, len(b_xs) // 30),
                                              label=_('Base Period') + ' - ' + chart_info['title'])

                        data_len = len(r_raw)
                        step = max(1, data_len // 10)
                        ax_chart.set_xticks(range(0, data_len, step))
                        ax_chart.set_xticklabels(
                            [reporting_times[t][:10] if t < len(reporting_times) else ''
                             for t in range(0, data_len, step)],
                            rotation=45, ha='right', fontsize=7)
                        ax_chart.set_title(
                            _('Base Period Cumulative Efficiency') + ' / ' +
                            _('Reporting Period Cumulative Efficiency') + ' - ' +
                            chart_info['title'],
                            fontsize=8, weight='bold')
                        ax_chart.legend(fontsize=7)
                        ax_chart.grid(True, alpha=0.3)
                    except Exception as e:
                        logger.error(f"Error plotting chart: {e}")

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
    exporter = EquipmentEfficiencyPDFExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
