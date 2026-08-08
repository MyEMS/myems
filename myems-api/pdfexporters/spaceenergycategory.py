"""
Space Energy Category PDF Exporter

This module provides functionality to export space energy category data to PDF format.
It generates comprehensive reports showing energy consumption breakdown by categories
for spaces with detailed analysis and visualizations.

Key Features:
- Space energy consumption by category
- Base period vs reporting period comparison
- Energy category proportion analysis
- Detailed data with charts
- Child spaces analysis
- Multi-language support
- Base64 encoding for file transmission

The exported PDF file includes:
- Energy consumption summary by category
- Base period comparison data
- Category proportion analysis with pie charts
- Detailed time-series data with line charts
- Child spaces data with charts
- Parameter data (if available)
"""

import base64
import os
import uuid

from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, List, Any
import logging

import matplotlib.pyplot as plt

from matplotlib.backends.backend_pdf import PdfPages
from matplotlib.patches import Rectangle
import matplotlib.gridspec as gridspec
import numpy as np

from core.utilities import get_translation, round2

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Setup Chinese font support
def setup_chinese_fonts():
    """Setup Chinese font support for matplotlib"""
    font_list = [
        'SimHei', 'Microsoft YaHei', 'WenQuanYi Micro Hei',
        'Noto Sans CJK SC', 'PingFang SC', 'Heiti SC',
        'DejaVu Sans', 'Arial Unicode MS'
    ]

    for font in font_list:
        try:
            plt.rcParams['font.sans-serif'] = [font]
            plt.rcParams['axes.unicode_minus'] = False
            return True
        except Exception:
            continue

    plt.rcParams['font.sans-serif'] = ['DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False
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


class SpaceEnergyPDFExporter:
    """
    Export space energy category data to PDF format.
    Generates comprehensive reports with charts and tables.
    """

    def __init__(self, language: str = 'zh_CN'):
        """
        Initialize the PDF exporter.

        Args:
            language: Language code ('zh_CN', 'en_US', etc.)
        """
        # Setup Chinese fonts lazily on first instantiation
        setup_chinese_fonts()

        self.language = language
        self.trans = get_translation(language)
        self.trans.install()
        self._ = self.trans.gettext

        # Page settings
        self.page_size = (11.69, 8.27)  # A4 landscape
        self.dpi = 100

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

        Args:
            report: Report data dictionary
            name: Site/space name
            base_period_start_datetime_local: Base period start
            base_period_end_datetime_local: Base period end
            reporting_start_datetime_local: Reporting period start
            reporting_end_datetime_local: Reporting period end
            period_type: Period type
            language: Language code

        Returns:
            Optional[str]: Base64 encoded PDF data, or None if report is invalid
        """
        if report is None:
            return None

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

        Returns:
            Optional[str]: Path to generated PDF file, or None if no data available
        """
        _ = self._

        # Check if there is data
        if "reporting_period" not in report.keys() or \
                "names" not in report['reporting_period'].keys() or \
                len(report['reporting_period']['names']) == 0:
            return None

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
            self._create_cover_page(pdf)

            # Summary page - Reporting Period Consumption
            self._create_reporting_period_page(pdf)

            # Time-of-use consumption
            self._create_time_of_use_page(pdf)

            # TCE by category
            self._create_tce_page(pdf)

            # CO2E by category
            self._create_co2e_page(pdf)

            # Child spaces data
            self._create_child_spaces_page(pdf)

            # Working/Non-working days comparison (Base Period)
            self._create_base_period_working_days_page(pdf)

            # Working/Non-working days comparison (Reporting Period)
            self._create_reporting_working_days_page(pdf)

            # Detailed data
            self._create_detailed_data_page(pdf)

            # Parameters
            self._create_parameters_page(pdf)

        logger.info(f"PDF generated: {filename}")
        return filename

    def _create_cover_page(self, pdf: PdfPages):
        """Create cover page."""
        _ = self._
        fig, ax = plt.subplots(figsize=self.page_size)
        ax.axis('off')

        # Background
        ax.add_patch(Rectangle((0, 0), 1, 1, transform=ax.transAxes,
                               facecolor='#F8F9FA', edgecolor='none'))

        # Title
        ax.text(0.5, 0.75, self.name, fontsize=36, ha='center',
                weight='bold', color='#4472C4', transform=ax.transAxes)

        ax.text(0.5, 0.65, _('Energy Consumption Report'), fontsize=28, ha='center',
                weight='bold', transform=ax.transAxes)

        # Subtitle
        ax.text(0.5, 0.55, _('Space Energy Category Analysis'), fontsize=16, ha='center',
                style='italic', color='#666666', transform=ax.transAxes)

        # Report period
        ax.text(0.5, 0.40, _('Reporting Period') + ': ' + self.reporting_start + ' - ' + self.reporting_end,
                fontsize=14, ha='center', transform=ax.transAxes)

        ax.text(0.5, 0.35, _('Period Type') + ': ' + self.period_type,
                fontsize=14, ha='center', transform=ax.transAxes)

        if self.is_base_period_exists:
            ax.text(0.5, 0.30, _('Base Period') + ': ' + self.base_period_start + ' - ' + self.base_period_end,
                    fontsize=14, ha='center', transform=ax.transAxes)

        # Footer
        ax.text(0.5, 0.05, _('Generated') + ': ' + datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                fontsize=10, ha='center', color='#999999', transform=ax.transAxes)

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_reporting_period_page(self, pdf: PdfPages):
        """Create reporting period consumption page."""
        _ = self._
        fig = plt.figure(figsize=self.page_size)

        reporting_data = self.report['reporting_period']
        if "names" not in reporting_data.keys() or reporting_data['names'] is None:
            plt.close()
            return

        names = reporting_data['names']
        subtotals = reporting_data['subtotals']
        units = reporting_data['units']

        # Create layout: table on left, chart on right
        gs = gridspec.GridSpec(1, 2, width_ratios=[0.5, 0.5])
        ax_table = fig.add_subplot(gs[0])
        ax_table.axis('off')
        ax_chart = fig.add_subplot(gs[1])

        # Title
        fig.suptitle(self.name + ' ' + _('Reporting Period Consumption'),
                     fontsize=16, weight='bold', y=0.98)

        # Table
        table_data = [[_('Category'), _('Consumption'), _('Unit')]]
        for name, value, unit in zip(names, subtotals, units):
            table_data.append([name, f'{round2(value, 2)}', unit])

        # Add TCE and CO2
        total_kgce = reporting_data.get('total_in_kgce', 0)
        total_kgco2e = reporting_data.get('total_in_kgco2e', 0)
        table_data.append([_('Ton of Standard Coal'), f'{round2(total_kgce/1000, 2)}', 'TCE'])
        table_data.append([_('Ton of Carbon Dioxide Emissions'), f'{round2(total_kgco2e/1000, 2)}', 'TCO2E'])

        table = ax_table.table(cellText=table_data, loc='center',
                               cellLoc='center', colWidths=[0.4, 0.35, 0.25])
        table.auto_set_font_size(False)
        table.set_fontsize(11)

        # Style header
        for j in range(3):
            table[0, j].set_facecolor(self.colors['table_header'])
            table[0, j].set_text_props(color='white', weight='bold')

        # Style data rows
        for i in range(1, len(table_data)):
            for j in range(3):
                if i % 2 == 0:
                    table[i, j].set_facecolor(self.colors['table_alternate'])

        # Bar chart
        bar_colors = self.colors['chart_colors'][:len(names)]
        bars = ax_chart.bar(names, subtotals, color=bar_colors)
        ax_chart.set_ylabel(_('Consumption'))
        ax_chart.set_title(_('Consumption by Category'), fontsize=14)
        ax_chart.tick_params(axis='x', rotation=45)
        ax_chart.grid(True, alpha=0.3, axis='y')

        # Add value labels
        for bar, v in zip(bars, subtotals):
            ax_chart.text(bar.get_x() + bar.get_width()/2,
                          bar.get_height() + max(subtotals)*0.02,
                          f'{round2(v, 0)}', ha='center', fontsize=9)

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_time_of_use_page(self, pdf: PdfPages):
        """Create time-of-use consumption page."""
        _ = self._
        fig, axes = plt.subplots(1, 2, figsize=self.page_size)

        reporting_data = self.report['reporting_period']

        # Find electricity index
        electricity_index = -1
        for i in range(len(reporting_data.get('energy_category_ids', []))):
            if reporting_data['energy_category_ids'][i] == 1:
                electricity_index = i
                break

        if electricity_index < 0:
            # No electricity data
            axes[0].text(0.5, 0.5, _('No electricity data available'),
                         fontsize=14, ha='center', transform=axes[0].transAxes)
            axes[0].axis('off')
            axes[1].axis('off')
            plt.tight_layout()
            pdf.savefig(fig)
            plt.close()
            return

        toppeaks = reporting_data.get('toppeaks', [])
        onpeaks = reporting_data.get('onpeaks', [])
        midpeaks = reporting_data.get('midpeaks', [])
        offpeaks = reporting_data.get('offpeaks', [])

        categories = [_('TopPeak'), _('OnPeak'), _('MidPeak'), _('OffPeak')]
        values = [
            toppeaks[electricity_index] if electricity_index < len(toppeaks) else 0,
            onpeaks[electricity_index] if electricity_index < len(onpeaks) else 0,
            midpeaks[electricity_index] if electricity_index < len(midpeaks) else 0,
            offpeaks[electricity_index] if electricity_index < len(offpeaks) else 0
        ]

        # Left: Bar chart
        colors = ['#FF1744', '#FF6F00', '#FDD835', '#00BCD4']
        bars = axes[0].bar(categories, values, color=colors)
        axes[0].set_title(_('Electricity Consumption by Time-Of-Use'), fontsize=14, weight='bold')
        axes[0].set_ylabel('kWh')
        axes[0].grid(True, alpha=0.3, axis='y')

        total = sum(values)
        for bar, v in zip(bars, values):
            axes[0].text(bar.get_x() + bar.get_width()/2,
                         bar.get_height() + max(values)*0.02 if max(values) > 0 else 1,
                         f'{round2(v, 0)}', ha='center', fontsize=9)
            if total > 0:
                pct = (v/total)*100
                axes[0].text(bar.get_x() + bar.get_width()/2,
                             max(values)/10 if max(values) > 0 else 1,
                             f'{pct:.1f}%', ha='center', va='center',
                             color='white', weight='bold')

        # Right: Pie chart
        if total > 0:
            axes[1].pie(values, labels=categories, autopct='%1.1f%%',
                        colors=colors, explode=[0.05, 0, 0, 0])
            axes[1].set_title(_('Distribution'), fontsize=14, weight='bold')
        else:
            axes[1].text(0.5, 0.5, _('No data'), fontsize=14, ha='center',
                         transform=axes[1].transAxes)
            axes[1].axis('off')

        fig.suptitle(self.name + ' ' + _('Electricity Consumption by Time-Of-Use'),
                     fontsize=16, weight='bold', y=0.98)
        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_tce_page(self, pdf: PdfPages):
        """Create TCE by category page."""
        _ = self._
        fig, axes = plt.subplots(1, 2, figsize=self.page_size)

        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        subtotals_in_kgce = reporting_data.get('subtotals_in_kgce', [])

        if not subtotals_in_kgce or sum(subtotals_in_kgce) == 0:
            axes[0].text(0.5, 0.5, _('No TCE data available'),
                         fontsize=14, ha='center', transform=axes[0].transAxes)
            axes[0].axis('off')
            axes[1].axis('off')
            plt.tight_layout()
            pdf.savefig(fig)
            plt.close()
            return

        # Convert to tonnes
        tce_values = [v/1000 for v in subtotals_in_kgce]

        # Filter zero values
        filtered = [(n, v) for n, v in zip(names, tce_values) if v > 0]
        if not filtered:
            axes[0].text(0.5, 0.5, _('No positive values'), fontsize=14, ha='center',
                         transform=axes[0].transAxes)
            axes[0].axis('off')
            axes[1].axis('off')
            plt.tight_layout()
            pdf.savefig(fig)
            plt.close()
            return

        f_names, f_values = zip(*filtered)

        # Left: Bar chart
        colors = self.colors['chart_colors'][:len(f_names)]
        bars = axes[0].bar(f_names, f_values, color=colors)
        axes[0].set_title(_('Ton of Standard Coal(TCE) by Energy Category'), fontsize=14, weight='bold')
        axes[0].set_ylabel('TCE')
        axes[0].tick_params(axis='x', rotation=45)
        axes[0].grid(True, alpha=0.3, axis='y')

        for bar, v in zip(bars, f_values):
            axes[0].text(bar.get_x() + bar.get_width()/2,
                         bar.get_height() + max(f_values)*0.02,
                         f'{v:.3f}', ha='center', fontsize=9)

        # Right: Pie chart
        axes[1].pie(f_values, labels=f_names, autopct='%1.1f%%',
                    colors=colors)
        axes[1].set_title(_('Distribution'), fontsize=14, weight='bold')

        fig.suptitle(self.name + ' ' + _('Ton of Standard Coal(TCE) by Energy Category'),
                     fontsize=16, weight='bold', y=0.98)
        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_co2e_page(self, pdf: PdfPages):
        """Create CO2E by category page."""
        _ = self._
        fig, axes = plt.subplots(1, 2, figsize=self.page_size)

        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        subtotals_in_kgco2e = reporting_data.get('subtotals_in_kgco2e', [])

        if not subtotals_in_kgco2e or sum(subtotals_in_kgco2e) == 0:
            axes[0].text(0.5, 0.5, _('No CO2E data available'),
                         fontsize=14, ha='center', transform=axes[0].transAxes)
            axes[0].axis('off')
            axes[1].axis('off')
            plt.tight_layout()
            pdf.savefig(fig)
            plt.close()
            return

        # Convert to tonnes
        co2e_values = [v/1000 for v in subtotals_in_kgco2e]

        # Filter zero values
        filtered = [(n, v) for n, v in zip(names, co2e_values) if v > 0]
        if not filtered:
            axes[0].text(0.5, 0.5, _('No positive values'), fontsize=14, ha='center',
                         transform=axes[0].transAxes)
            axes[0].axis('off')
            axes[1].axis('off')
            plt.tight_layout()
            pdf.savefig(fig)
            plt.close()
            return

        f_names, f_values = zip(*filtered)

        # Left: Bar chart
        colors = self.colors['chart_colors'][:len(f_names)]
        bars = axes[0].bar(f_names, f_values, color=colors)
        axes[0].set_title(_('Ton of Carbon Dioxide Emissions(TCO2E) by Energy Category'), fontsize=14, weight='bold')
        axes[0].set_ylabel('TCO2E')
        axes[0].tick_params(axis='x', rotation=45)
        axes[0].grid(True, alpha=0.3, axis='y')

        for bar, v in zip(bars, f_values):
            axes[0].text(bar.get_x() + bar.get_width()/2,
                         bar.get_height() + max(f_values)*0.02,
                         f'{v:.3f}', ha='center', fontsize=9)

        # Right: Pie chart
        axes[1].pie(f_values, labels=f_names, autopct='%1.1f%%',
                    colors=colors)
        axes[1].set_title(_('Distribution'), fontsize=14, weight='bold')

        fig.suptitle(self.name + ' ' + _('Ton of Carbon Dioxide Emissions(TCO2E) by Energy Category'),
                     fontsize=16, weight='bold', y=0.98)
        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_child_spaces_page(self, pdf: PdfPages):
        """Create child spaces data page."""
        _ = self._

        child = self.report.get('child_space', {})
        if not child or 'energy_category_names' not in child or not child['energy_category_names']:
            # Skip if no child space data
            return

        fig = plt.figure(figsize=self.page_size)
        gs = gridspec.GridSpec(1, 2, width_ratios=[0.6, 0.4])
        ax_table = fig.add_subplot(gs[0])
        ax_table.axis('off')
        ax_chart = fig.add_subplot(gs[1])

        fig.suptitle(self.name + ' ' + _('Child Spaces Data'),
                     fontsize=16, weight='bold', y=0.98)

        names_array = child.get('child_space_names_array', [])
        child_names = names_array[0] if names_array else []
        category_names = child.get('energy_category_names', [])
        subtotals_array = child.get('subtotals_array', [])
        ids_array = child.get('child_space_ids_array', [])
        child_ids = ids_array[0] if ids_array else []

        # Table
        table_data = [[_('ID'), _('Child Space')] + category_names]

        for i, name in enumerate(child_names):
            row = [str(child_ids[i]) if i < len(child_ids) else str(i+1), name]
            for j in range(len(category_names)):
                if j < len(subtotals_array) and i < len(subtotals_array[j]):
                    row.append(f'{round2(subtotals_array[j][i], 2)}')
                else:
                    row.append('-')
            table_data.append(row)

        # Limit rows for display
        max_rows = 20
        if len(table_data) > max_rows + 1:
            table_data = table_data[:max_rows + 1]

        col_widths = [0.08, 0.22] + [0.14] * len(category_names)
        table = ax_table.table(cellText=table_data, loc='center',
                               cellLoc='center', colWidths=col_widths)
        table.auto_set_font_size(False)
        table.set_fontsize(8)

        # Style header
        for j in range(len(table_data[0])):
            table[0, j].set_facecolor(self.colors['table_header'])
            table[0, j].set_text_props(color='white', weight='bold')

        # Alternate row colors
        for i in range(1, len(table_data)):
            for j in range(len(table_data[0])):
                if i % 2 == 0:
                    table[i, j].set_facecolor(self.colors['table_alternate'])

        # Pie chart for first category
        if category_names and subtotals_array and len(subtotals_array[0]) > 0:
            values = subtotals_array[0]
            labels = child_names[:len(values)]

            # Filter zero values
            filtered = [(l, v) for l, v in zip(labels, values) if v > 0]
            if filtered:
                f_labels, f_values = zip(*filtered)
                # Limit to top 8 for readability
                if len(f_labels) > 8:
                    sorted_data = sorted(zip(f_labels, f_values), key=lambda x: x[1], reverse=True)
                    top_data = sorted_data[:7]
                    other_sum = sum(v for _, v in sorted_data[7:])
                    f_labels = [l for l, _ in top_data] + [_('Others')]
                    f_values = [v for _, v in top_data] + [other_sum]

                colors = self.colors['chart_colors'][:len(f_labels)]
                ax_chart.pie(f_values, labels=f_labels, autopct='%1.1f%%',
                             colors=colors)
                ax_chart.set_title(f'{category_names[0]} ' + _('Distribution'), fontsize=12, weight='bold')

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_base_period_working_days_page(self, pdf: PdfPages):
        """Create base period working/non-working days comparison page."""
        _ = self._

        base_period = self.report.get('base_period', {})
        if not self.is_base_period_exists:
            return

        non_working = base_period.get('non_working_days_subtotals', [])
        working = base_period.get('working_days_subtotals', [])
        names = base_period.get('names', [])

        if not working or not non_working or sum(working) == 0:
            return

        fig, ax = plt.subplots(figsize=self.page_size)

        x = np.arange(len(names))
        width = 0.35

        bars1 = ax.bar(x - width/2, working, width, label=_('Working Days'), color='#70AD47')
        bars2 = ax.bar(x + width/2, non_working, width, label=_('Non Working Days'), color='#ED7D31')

        ax.set_xlabel(_('Category'))
        ax.set_ylabel(_('Consumption'))
        ax.set_title(self.name + ' ' + _('Base Period Consumption - Working vs Non-Working Days'),
                     fontsize=14, weight='bold')
        ax.set_xticks(x)
        ax.set_xticklabels(names, rotation=45)
        ax.legend()
        ax.grid(True, alpha=0.3, axis='y')

        # Add value labels
        for bar in bars1:
            height = bar.get_height()
            if height > 0:
                ax.text(bar.get_x() + bar.get_width()/2, height + max(working)*0.02,
                        f'{round2(height, 0)}', ha='center', fontsize=8)

        for bar in bars2:
            height = bar.get_height()
            if height > 0:
                ax.text(bar.get_x() + bar.get_width()/2, height + max(non_working)*0.02,
                        f'{round2(height, 0)}', ha='center', fontsize=8)

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_reporting_working_days_page(self, pdf: PdfPages):
        """Create reporting period working/non-working days comparison page."""
        _ = self._

        reporting_period = self.report.get('reporting_period', {})
        non_working = reporting_period.get('non_working_days_subtotals', [])
        working = reporting_period.get('working_days_subtotals', [])
        names = reporting_period.get('names', [])

        if not working or not non_working or sum(working) == 0:
            return

        fig, ax = plt.subplots(figsize=self.page_size)

        x = np.arange(len(names))
        width = 0.35

        bars1 = ax.bar(x - width/2, working, width, label=_('Working Days'), color='#70AD47')
        bars2 = ax.bar(x + width/2, non_working, width, label=_('Non Working Days'), color='#ED7D31')

        ax.set_xlabel(_('Category'))
        ax.set_ylabel(_('Consumption'))
        ax.set_title(self.name + ' ' + _('Reporting Period Consumption - Working vs Non-Working Days'),
                     fontsize=14, weight='bold')
        ax.set_xticks(x)
        ax.set_xticklabels(names, rotation=45)
        ax.legend()
        ax.grid(True, alpha=0.3, axis='y')

        # Add value labels
        for bar in bars1:
            height = bar.get_height()
            if height > 0:
                ax.text(bar.get_x() + bar.get_width()/2, height + max(working)*0.02,
                        f'{round2(height, 0)}', ha='center', fontsize=8)

        for bar in bars2:
            height = bar.get_height()
            if height > 0:
                ax.text(bar.get_x() + bar.get_width()/2, height + max(non_working)*0.02,
                        f'{round2(height, 0)}', ha='center', fontsize=8)

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_detailed_data_page(self, pdf: PdfPages):
        """Create detailed data page with table and line charts."""
        _ = self._

        reporting_data = self.report['reporting_period']
        timestamps = reporting_data.get('timestamps', [])

        if not timestamps or len(timestamps[0]) == 0:
            return

        names = reporting_data.get('names', [])
        values = reporting_data.get('values', [])
        subtotals = reporting_data.get('subtotals', [])

        # Create one page per category with line chart
        for i, name in enumerate(names):
            if i >= len(values) or len(values[i]) == 0:
                continue

            fig, axes = plt.subplots(2, 1, figsize=self.page_size,
                                     gridspec_kw={'height_ratios': [0.6, 0.4]})

            # Line chart
            ax_chart = axes[0]
            times = timestamps[0]
            data = values[i]

            ax_chart.plot(range(len(data)), data, marker='o', linewidth=2,
                          color='#4472C4', markersize=6, label=name)
            ax_chart.fill_between(range(len(data)), data, alpha=0.2, color='#4472C4')

            # Add trend line
            if len(data) > 1:
                z = np.polyfit(range(len(data)), data, 1)
                p = np.poly1d(z)
                ax_chart.plot(range(len(data)), p(range(len(data))), '--',
                              color='#FF6B6B', linewidth=1.5, label=_('Trend'))

            ax_chart.set_xticks(range(len(data)))
            ax_chart.set_xticklabels([t[:10] for t in times], rotation=45, ha='right')
            ax_chart.set_ylabel(name + ' (' + reporting_data['units'][i] + ')')
            ax_chart.set_title(_('Reporting Period Consumption') + ' - ' + name,
                               fontsize=14, weight='bold')
            ax_chart.legend()
            ax_chart.grid(True, alpha=0.3)

            # Add average line
            avg = np.mean(data)
            ax_chart.axhline(y=avg, color='#70AD47', linestyle=':', linewidth=1.5,
                             label=f'{_("Average")}: {round2(avg, 2)}')
            ax_chart.legend()

            # Data table
            ax_table = axes[1]
            ax_table.axis('off')

            # Show last 10 entries
            display_count = min(10, len(data))
            start_idx = len(data) - display_count

            table_data = [[_('Time'), name + ' (' + reporting_data['units'][i] + ')']]
            for j in range(display_count):
                idx = start_idx + j
                table_data.append([times[idx], f'{round2(data[idx], 2)}'])

            # Add subtotal
            if subtotals and i < len(subtotals):
                table_data.append([_('Subtotal'), f'{round2(subtotals[i], 2)}'])

            table = ax_table.table(cellText=table_data, loc='center',
                                   cellLoc='center', colWidths=[0.5, 0.5])
            table.auto_set_font_size(False)
            table.set_fontsize(8)

            # Style header
            table[0, 0].set_facecolor(self.colors['table_header'])
            table[0, 0].set_text_props(color='white', weight='bold')
            table[0, 1].set_facecolor(self.colors['table_header'])
            table[0, 1].set_text_props(color='white', weight='bold')

            # Style subtotal row
            if subtotals and i < len(subtotals):
                last_row = len(table_data) - 1
                table[last_row, 0].set_facecolor(self.colors['table_alternate'])
                table[last_row, 0].set_text_props(weight='bold')
                table[last_row, 1].set_facecolor(self.colors['table_alternate'])
                table[last_row, 1].set_text_props(weight='bold')

            plt.tight_layout()
            pdf.savefig(fig)
            plt.close()

    def _create_parameters_page(self, pdf: PdfPages):
        """Create parameters page with charts."""
        _ = self._

        params = self.report.get('parameters', {})
        if not params or not params.get('names') or not params.get('timestamps'):
            return

        names = params.get('names', [])
        timestamps = params.get('timestamps', [])
        values = params.get('values', [])

        # Create page for each parameter
        for i, name in enumerate(names):
            if i >= len(timestamps) or len(timestamps[i]) == 0:
                continue
            if i >= len(values) or len(values[i]) == 0:
                continue

            fig, axes = plt.subplots(2, 1, figsize=self.page_size,
                                     gridspec_kw={'height_ratios': [0.6, 0.4]})

            # Line chart
            ax_chart = axes[0]
            times = timestamps[i]
            data = values[i]

            ax_chart.plot(range(len(data)), data, marker='o', linewidth=2,
                          color='#5B9BD5', markersize=6, label=name)
            ax_chart.fill_between(range(len(data)), data, alpha=0.2, color='#5B9BD5')

            ax_chart.set_xticks(range(len(data)))
            ax_chart.set_xticklabels([t[:10] for t in times], rotation=45, ha='right')
            ax_chart.set_ylabel(name)
            ax_chart.set_title(_('Parameters') + ' - ' + name,
                               fontsize=14, weight='bold')
            ax_chart.grid(True, alpha=0.3)

            # Data table
            ax_table = axes[1]
            ax_table.axis('off')

            # Show last 10 entries
            display_count = min(10, len(data))
            start_idx = len(data) - display_count

            table_data = [[_('Time'), name]]
            for j in range(display_count):
                idx = start_idx + j
                table_data.append([times[idx], f'{round2(data[idx], 2)}'])

            table = ax_table.table(cellText=table_data, loc='center',
                                   cellLoc='center', colWidths=[0.5, 0.5])
            table.auto_set_font_size(False)
            table.set_fontsize(8)

            # Style header
            table[0, 0].set_facecolor(self.colors['table_header'])
            table[0, 0].set_text_props(color='white', weight='bold')
            table[0, 1].set_facecolor(self.colors['table_header'])
            table[0, 1].set_text_props(color='white', weight='bold')

            plt.tight_layout()
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
    exporter = SpaceEnergyPDFExporter(language)
    return exporter.export(report, name,
                           base_period_start_datetime_local,
                           base_period_end_datetime_local,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)


 