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
import matplotlib

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
    """
    Setup Chinese font support for matplotlib.
    Enhanced version for Kylin V11 and other Linux systems.
    """

    # 1. First try to load fonts using absolute paths (most reliable)
    font_paths = [
        # Kylin system font paths
        '/usr/share/fonts/wqy/wqy-microhei.ttc',
        '/usr/share/fonts/wqy/wqy-zenhei.ttc',
        '/usr/share/fonts/chinese/simhei.ttf',
        '/usr/share/fonts/chinese/simsun.ttc',
        '/usr/share/fonts/truetype/wqy/wqy-microhei.ttc',
        '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc',
        '/usr/share/fonts/google-noto-cjk/NotoSansCJK-Regular.ttc',
        '/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc',
        '/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc',
        # User font directories
        os.path.expanduser('~/.fonts/wqy-microhei.ttc'),
        os.path.expanduser('~/.fonts/wqy-zenhei.ttc'),
        os.path.expanduser('~/.fonts/simhei.ttf'),
        os.path.expanduser('~/.local/share/fonts/wqy-microhei.ttc'),
        os.path.expanduser('~/.local/share/fonts/wqy-zenhei.ttc'),
    ]

    # Try each font path
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                # Clear existing font cache to force reload
                if hasattr(matplotlib, '_get_cachedir'):
                    cache_dir = matplotlib._get_cachedir()
                    if os.path.exists(cache_dir):
                        import shutil
                        shutil.rmtree(cache_dir)
                        logger.info(f"Cleared matplotlib font cache: {cache_dir}")

                # Set font using file path
                from matplotlib.font_manager import FontProperties
                prop = FontProperties(fname=font_path)
                plt.rcParams['font.family'] = prop.get_name()
                plt.rcParams['axes.unicode_minus'] = False
                logger.info(f"Successfully loaded font from: {font_path}")
                return True
            except Exception as e:
                logger.warning(f"Failed to load font from {font_path}: {e}")
                continue

    # 2. Try using font names (if fonts are installed in system)
    try:
        import matplotlib.font_manager as fm
        # Rebuild font cache if possible
        try:
            fm._rebuild()
            logger.info("Rebuilt matplotlib font cache")
        except Exception as e:
            logger.warning(f"Could not rebuild font cache: {e}")

        # Get available fonts
        available_fonts = [f.name for f in fm.fontManager.ttflist]
        logger.debug(f"Available fonts: {available_fonts[:20]}")

        # Priority list of Chinese fonts
        font_names = [
            'WenQuanYi Micro Hei',
            'WenQuanYi Zen Hei',
            'Noto Sans CJK SC',
            'Noto Sans CJK JP',
            'Noto Sans CJK TC',
            'Noto Sans S Chinese',
            'Noto Sans SC',
            'SimHei',
            'Microsoft YaHei',
            'PingFang SC',
            'Heiti SC',
            'STHeiti',
            'STSong',
            'STKaiti',
            'FangSong',
            'KaiTi',
            'SimSun',
            'AR PL UKai CN',
            'AR PL UMing CN',
        ]

        for font_name in font_names:
            # Check if font is available
            is_available = False
            for available in available_fonts:
                if font_name.lower() in available.lower() or available.lower() in font_name.lower():
                    is_available = True
                    logger.info(f"Found matching font: {available} (requested: {font_name})")
                    break

            if is_available:
                try:
                    plt.rcParams['font.sans-serif'] = [font_name]
                    plt.rcParams['axes.unicode_minus'] = False
                    logger.info(f"Successfully set font to: {font_name}")
                    return True
                except Exception as e:
                    logger.warning(f"Failed to set font {font_name}: {e}")
                    continue

        # 3. Try to auto-select any Chinese font
        try:
            for f in fm.fontManager.ttflist:
                font_name_lower = f.name.lower()
                keywords = ['wenquan', 'noto', 'simhei', 'simsun', 'kaiti', 'fangsong',
                            'stsong', 'stkaiti', 'stzhongsong', 'microsoft', 'pingfang',
                            'heiti', 'cjk', 'chinese', 'cn', 'sc', 'tc']
                if any(keyword in font_name_lower for keyword in keywords):
                    logger.info(f"Auto-selected font: {f.name}")
                    plt.rcParams['font.sans-serif'] = [f.name]
                    plt.rcParams['axes.unicode_minus'] = False
                    return True
        except Exception as e:
            logger.warning(f"Failed to auto-select font: {e}")

    except Exception as e:
        logger.warning(f"Error during font setup: {e}")

    # 4. Fallback to DejaVu Sans (may not display Chinese properly)
    plt.rcParams['font.sans-serif'] = ['DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False
    logger.warning("No Chinese font found, using DejaVu Sans (Chinese may not display correctly)")
    logger.warning("Please install Chinese fonts: yum install wqy-zenhei-fonts wqy-microhei-fonts")
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


def _style_table_header(table, num_cols, header_color='#4472C4'):
    """Style table header row with background color and white bold text."""
    for j in range(num_cols):
        table[0, j].set_facecolor(header_color)
        table[0, j].set_text_props(color='white', weight='bold')


def _style_table_alternate(table, num_rows, num_cols, alternate_color='#E8EDF5'):
    """Style alternating rows in a table."""
    for i in range(1, num_rows):
        for j in range(num_cols):
            if i % 2 == 0:
                table[i, j].set_facecolor(alternate_color)


def _style_table_borders(table, num_rows, num_cols):
    """Add borders to all cells in a table."""
    for i in range(num_rows):
        for j in range(num_cols):
            table[i, j].set_edgecolor('#333333')
            table[i, j].set_linewidth(0.5)


class SpaceEnergyPDFExporter:
    """
    Export space energy category data to PDF format.
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

            # Summary page - Reporting Period Consumption (matching Excel rows 7-11)
            self._create_reporting_period_page(pdf)

            # Time-of-use consumption (matching Excel rows 13-19)
            self._create_time_of_use_page(pdf)

            # TCE by category (matching Excel row 20+)
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

    def _create_cover_page(self, pdf: PdfPages, name: str, period_type: str,
                           reporting_start: str, reporting_end: str,
                           base_period_start: str, base_period_end: str,
                           has_base_period: bool):
        """Create cover page matching Excel header section."""
        _ = self._
        fig, ax = plt.subplots(figsize=self.page_size)
        ax.axis('off')

        # Background
        ax.add_patch(Rectangle((0, 0), 1, 1, transform=ax.transAxes,
                               facecolor='#F8F9FA', edgecolor='none'))

        # Title
        ax.text(0.5, 0.75, name, fontsize=36, ha='center',
                weight='bold', color='#4472C4', transform=ax.transAxes)

        ax.text(0.5, 0.65, _('Energy Consumption Report'), fontsize=28, ha='center',
                weight='bold', transform=ax.transAxes)

        # Info table matching Excel layout
        info_data = [
            [_('Name'), name, _('Period Type'), period_type],
            [_('Reporting Start Datetime'), reporting_start,
             _('Reporting End Datetime'), reporting_end],
        ]
        if has_base_period:
            info_data.append([_('Base Period Start Datetime'), base_period_start,
                              _('Base Period End Datetime'), base_period_end])

        table = ax.table(cellText=info_data, loc='center',
                         cellLoc='center', colWidths=[0.2, 0.3, 0.2, 0.3])
        table.auto_set_font_size(False)
        table.set_fontsize(11)

        # Style header
        for i in range(len(info_data)):
            for j in [0, 2]:
                table[i, j].set_facecolor('#E8EDF5')
                table[i, j].set_text_props(weight='bold')

        # Footer
        ax.text(0.5, 0.05, _('Generated') + ': ' + datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                fontsize=10, ha='center', color='#999999', transform=ax.transAxes)

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_reporting_period_page(self, pdf: PdfPages):
        """Create reporting period consumption page matching Excel rows 7-11. Table only, no chart."""
        _ = self._
        reporting_data = self.report['reporting_period']
        if "names" not in reporting_data.keys() or reporting_data['names'] is None:
            return

        names = reporting_data['names']
        units = reporting_data['units']
        subtotals = reporting_data['subtotals']
        subtotals_per_unit_area = reporting_data.get('subtotals_per_unit_area', [])
        increment_rates = reporting_data.get('increment_rates', [])
        ca_len = len(names)

        fig, ax = plt.subplots(figsize=self.page_size)
        ax.axis('off')

        # Title
        fig.suptitle(self.name + ' ' + _('Reporting Period Consumption'),
                     fontsize=16, weight='bold', y=0.98)

        # Build table matching Excel: rows = Consumption/PerUnitArea/IncrementRate
        # Columns: label + each category + TCE + TCO2E
        # Build column headers
        col_headers = ['']
        for i in range(ca_len):
            col_headers.append(names[i] + ' (' + units[i] + ')')
        col_headers.append(_('Ton of Standard Coal') + '(TCE)')
        col_headers.append(_('Ton of Carbon Dioxide Emissions') + '(TCO2E)')

        # Build data rows
        consumption_row = ['']
        for i in range(ca_len):
            consumption_row.append(str(round2(subtotals[i], 2)))
        total_kgce = reporting_data.get('total_in_kgce', 0)
        total_kgco2e = reporting_data.get('total_in_kgco2e', 0)
        consumption_row.append(str(round2(total_kgce / 1000, 2)))
        consumption_row.append(str(round2(total_kgco2e / 1000, 2)))

        per_area_row = ['']
        for i in range(ca_len):
            val = subtotals_per_unit_area[i] if subtotals_per_unit_area and i < len(subtotals_per_unit_area) else None
            per_area_row.append(str(round2(val, 2)) if val is not None else '')
        total_kgce_per_area = reporting_data.get('total_in_kgce_per_unit_area', None)
        total_kgco2e_per_area = reporting_data.get('total_in_kgco2e_per_unit_area', None)
        per_area_row.append(str(round2(total_kgce_per_area / 1000, 2)) if total_kgce_per_area is not None else '')
        per_area_row.append(str(round2(total_kgco2e_per_area / 1000, 2)) if total_kgco2e_per_area is not None else '')

        increment_row = ['']
        for i in range(ca_len):
            val = increment_rates[i] if increment_rates and i < len(increment_rates) else None
            increment_row.append(str(round2(val * 100, 2)) + '%' if val is not None else '')
        inc_kgce = reporting_data.get('increment_rate_in_kgce', None)
        inc_kgco2e = reporting_data.get('increment_rate_in_kgco2e', None)
        increment_row.append(str(round2(inc_kgce * 100, 2)) + '%' if inc_kgce is not None else '')
        increment_row.append(str(round2(inc_kgco2e * 100, 2)) + '%' if inc_kgco2e is not None else '')

        table_data = [col_headers, consumption_row, per_area_row, increment_row]

        # Adjust column widths
        num_cols = len(col_headers)
        col_widths = [0.12] + [0.08] * (num_cols - 1)
        # Normalize widths to fit
        total_w = sum(col_widths)
        col_widths = [w / total_w for w in col_widths]

        table = ax.table(cellText=table_data, loc='center',
                         cellLoc='center', colWidths=col_widths)
        table.auto_set_font_size(False)
        table.set_fontsize(8)

        # Style header row (row 0 = column headers) with green like Excel
        for j in range(num_cols):
            table[0, j].set_facecolor('#90EE90')
            table[0, j].set_text_props(weight='bold')
        # Style row labels (first column of data rows)
        for i in range(1, 4):
            table[i, 0].set_facecolor('#90EE90')
            table[i, 0].set_text_props(weight='bold')

        _style_table_borders(table, len(table_data), num_cols)

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_time_of_use_page(self, pdf: PdfPages):
        """Create time-of-use consumption page matching Excel table + pie chart."""
        _ = self._
        reporting_data = self.report['reporting_period']

        # Find electricity index
        electricity_index = -1
        for i in range(len(reporting_data.get('energy_category_ids', []))):
            if reporting_data['energy_category_ids'][i] == 1:
                electricity_index = i
                break

        if electricity_index < 0:
            # No electricity data, skip this page
            return

        toppeaks = reporting_data.get('toppeaks', [])
        onpeaks = reporting_data.get('onpeaks', [])
        midpeaks = reporting_data.get('midpeaks', [])
        offpeaks = reporting_data.get('offpeaks', [])

        categories = [_('TopPeak'), _('OnPeak'), _('MidPeak'), _('OffPeak')]
        values = [
            round2(toppeaks[electricity_index], 2) if electricity_index < len(toppeaks) else 0,
            round2(onpeaks[electricity_index], 2) if electricity_index < len(onpeaks) else 0,
            round2(midpeaks[electricity_index], 2) if electricity_index < len(midpeaks) else 0,
            round2(offpeaks[electricity_index], 2) if electricity_index < len(offpeaks) else 0
        ]

        fig = plt.figure(figsize=self.page_size)
        gs = gridspec.GridSpec(1, 2, width_ratios=[0.4, 0.6])
        ax_table = fig.add_subplot(gs[0])
        ax_table.axis('off')
        ax_chart = fig.add_subplot(gs[1])

        # Title matching Excel
        fig.suptitle(self.name + ' ' + _('Electricity Consumption by Time-Of-Use'),
                     fontsize=16, weight='bold', y=0.98)

        # Table matching Excel rows 14-18: first col header is empty, second col header is the name
        table_data = [
            ['', _('Electricity Consumption by Time-Of-Use')],
            [_('TopPeak'), str(values[0])],
            [_('OnPeak'), str(values[1])],
            [_('MidPeak'), str(values[2])],
            [_('OffPeak'), str(values[3])],
        ]

        table = ax_table.table(cellText=table_data, loc='center',
                               cellLoc='center', colWidths=[0.5, 0.5])
        table.auto_set_font_size(False)
        table.set_fontsize(11)

        # Style header row with green
        table[0, 0].set_facecolor('#90EE90')
        table[0, 0].set_text_props(weight='bold')
        table[0, 1].set_facecolor('#90EE90')
        table[0, 1].set_text_props(weight='bold')
        _style_table_borders(table, len(table_data), 2)

        # Pie chart matching Excel
        total = sum(values)
        colors = ['#FF1744', '#FF6F00', '#FDD835', '#00BCD4']
        if total > 0:
            wedges, texts, autotexts = ax_chart.pie(
                values, labels=categories, autopct='%1.1f%%',
                colors=colors, startangle=90)
            ax_chart.set_title(self.name + ' ' + _('Electricity Consumption by Time-Of-Use'),
                               fontsize=12, weight='bold')
        else:
            ax_chart.text(0.5, 0.5, _('No data'), fontsize=14, ha='center',
                          transform=ax_chart.transAxes)
            ax_chart.axis('off')

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_tce_page(self, pdf: PdfPages):
        """Create TCE by category page matching Excel table + pie chart."""
        _ = self._
        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        subtotals_in_kgce = reporting_data.get('subtotals_in_kgce', [])

        if not subtotals_in_kgce or sum(subtotals_in_kgce) == 0:
            return

        # Convert to tonnes
        tce_values = [round2(v / 1000, 3) for v in subtotals_in_kgce]

        fig = plt.figure(figsize=self.page_size)
        gs = gridspec.GridSpec(1, 2, width_ratios=[0.4, 0.6])
        ax_table = fig.add_subplot(gs[0])
        ax_table.axis('off')
        ax_chart = fig.add_subplot(gs[1])

        # Title
        fig.suptitle(self.name + ' ' + _('Ton of Standard Coal(TCE) by Energy Category'),
                     fontsize=16, weight='bold', y=0.98)

        # Table matching Excel: first col header is empty, second col header is the name
        table_data = [['', _('Ton of Standard Coal(TCE) by Energy Category')]]
        for i in range(len(names)):
            table_data.append([names[i], str(tce_values[i])])

        table = ax_table.table(cellText=table_data, loc='center',
                               cellLoc='center', colWidths=[0.5, 0.5])
        table.auto_set_font_size(False)
        table.set_fontsize(10)

        # Style header with green
        table[0, 0].set_facecolor('#90EE90')
        table[0, 0].set_text_props(weight='bold')
        table[0, 1].set_facecolor('#90EE90')
        table[0, 1].set_text_props(weight='bold')
        _style_table_borders(table, len(table_data), 2)

        # Pie chart matching Excel
        filtered = [(n, v) for n, v in zip(names, tce_values) if v > 0]
        if filtered:
            f_names, f_values = zip(*filtered)
            colors = self.colors['chart_colors'][:len(f_names)]
            ax_chart.pie(f_values, labels=f_names, autopct='%1.1f%%', colors=colors)
        ax_chart.set_title(self.name + ' ' + _('Ton of Standard Coal(TCE) by Energy Category'),
                           fontsize=11, weight='bold')

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_co2e_page(self, pdf: PdfPages):
        """Create CO2E by category page matching Excel table + pie chart."""
        _ = self._
        reporting_data = self.report['reporting_period']
        names = reporting_data.get('names', [])
        subtotals_in_kgco2e = reporting_data.get('subtotals_in_kgco2e', [])

        if not subtotals_in_kgco2e or sum(subtotals_in_kgco2e) == 0:
            return

        # Convert to tonnes
        co2e_values = [round2(v / 1000, 3) for v in subtotals_in_kgco2e]

        fig = plt.figure(figsize=self.page_size)
        gs = gridspec.GridSpec(1, 2, width_ratios=[0.4, 0.6])
        ax_table = fig.add_subplot(gs[0])
        ax_table.axis('off')
        ax_chart = fig.add_subplot(gs[1])

        # Title
        fig.suptitle(self.name + ' ' + _('Ton of Carbon Dioxide Emissions(TCO2E) by Energy Category'),
                     fontsize=16, weight='bold', y=0.98)

        # Table matching Excel: first col header is empty, second col header is the name
        table_data = [['', _('Ton of Carbon Dioxide Emissions(TCO2E) by Energy Category')]]
        for i in range(len(names)):
            table_data.append([names[i], str(co2e_values[i])])

        table = ax_table.table(cellText=table_data, loc='center',
                               cellLoc='center', colWidths=[0.5, 0.5])
        table.auto_set_font_size(False)
        table.set_fontsize(10)

        # Style header with green
        table[0, 0].set_facecolor('#90EE90')
        table[0, 0].set_text_props(weight='bold')
        table[0, 1].set_facecolor('#90EE90')
        table[0, 1].set_text_props(weight='bold')
        _style_table_borders(table, len(table_data), 2)

        # Pie chart matching Excel
        filtered = [(n, v) for n, v in zip(names, co2e_values) if v > 0]
        if filtered:
            f_names, f_values = zip(*filtered)
            colors = self.colors['chart_colors'][:len(f_names)]
            ax_chart.pie(f_values, labels=f_names, autopct='%1.1f%%', colors=colors)
        ax_chart.set_title(self.name + ' ' + _('Ton of Carbon Dioxide Emissions(TCO2E) by Energy Category'),
                           fontsize=11, weight='bold')

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_child_spaces_page(self, pdf: PdfPages):
        """Create child spaces data page matching Excel table + multiple pie charts."""
        _ = self._

        child = self.report.get('child_space', {})
        if not child or 'energy_category_names' not in child or not child['energy_category_names']:
            return
        if 'child_space_ids_array' not in child or 'child_space_names_array' not in child:
            return
        if not child['child_space_ids_array'] or not child['child_space_names_array']:
            return
        if not child['child_space_names_array'][0] or len(child['child_space_names_array'][0]) == 0:
            return

        names_array = child['child_space_names_array']
        child_names = names_array[0]
        child_ids = child['child_space_ids_array'][0]
        category_names = child['energy_category_names']
        units = child.get('units', [])
        subtotals_array = child['subtotals_array']
        ca_len = len(category_names)
        space_len = len(child_names)

        fig = plt.figure(figsize=self.page_size)

        # Title
        fig.suptitle(self.name + ' ' + _('Child Spaces Data'),
                     fontsize=16, weight='bold', y=0.98)

        # Build table data matching Excel: ID, Child Space, then for each category: Value, Percentage
        col_headers = [_('ID'), _('Child Space')]
        for i in range(ca_len):
            col_headers.append(category_names[i] + ' (' + units[i] + ')')
            col_headers.append('')  # Percentage column

        table_data = [col_headers]
        for i in range(space_len):
            row = [str(child_ids[i]), child_names[i]]
            for j in range(ca_len):
                total = sum(subtotals_array[j]) if subtotals_array[j] else 0
                val = round2(subtotals_array[j][i], 2) if i < len(subtotals_array[j]) else 0
                row.append(str(val))
                pct = str(round2(val / total * 100, 2)) + '%' if total > 0 else '0.00%'
                row.append(pct)
            table_data.append(row)

        # Layout: table on top, pie charts below
        num_pie_rows = (ca_len + 2) // 3  # 3 charts per row
        gs = gridspec.GridSpec(1 + num_pie_rows, 1, height_ratios=[0.5] + [0.5] * num_pie_rows)
        ax_table = fig.add_subplot(gs[0])
        ax_table.axis('off')

        # Column widths
        num_cols = len(col_headers)
        col_widths = [0.05, 0.12]
        for i in range(ca_len):
            col_widths.extend([0.08, 0.06])
        # Normalize
        total_w = sum(col_widths)
        col_widths = [w / total_w for w in col_widths]

        table = ax_table.table(cellText=table_data, loc='center',
                               cellLoc='center', colWidths=col_widths)
        table.auto_set_font_size(False)
        table.set_fontsize(7)

        # Style header with green
        for j in range(num_cols):
            table[0, j].set_facecolor('#90EE90')
            table[0, j].set_text_props(weight='bold')
        _style_table_borders(table, len(table_data), num_cols)

        # Pie charts - one per category, 3 per row
        chart_axes = []
        for i in range(ca_len):
            row_idx = 1 + i // 3
            col_idx = i % 3
            if col_idx == 0:
                row_gs = gridspec.GridSpecFromSubplotSpec(1, 3, subplot_spec=gs[row_idx])
            ax_pie = fig.add_subplot(row_gs[col_idx])
            chart_axes.append(ax_pie)

            # Calculate values for this category
            values = []
            for s in range(space_len):
                val = subtotals_array[i][s] if s < len(subtotals_array[i]) else 0
                values.append(val)

            labels = child_names[:len(values)]
            filtered = [(l, v) for l, v in zip(labels, values) if v > 0]
            if filtered:
                f_labels, f_values = zip(*filtered)
                if len(f_labels) > 8:
                    sorted_data = sorted(zip(f_labels, f_values), key=lambda x: x[1], reverse=True)
                    top_data = sorted_data[:7]
                    other_sum = sum(v for _, v in sorted_data[7:])
                    f_labels = [l for l, _ in top_data] + [_('Others')]
                    f_values = [v for _, v in top_data] + [other_sum]

                colors = self.colors['chart_colors'][:len(f_labels)]
                ax_pie.pie(f_values, labels=f_labels, autopct='%1.1f%%', colors=colors)
            ax_pie.set_title(category_names[i] + ' (' + units[i] + ')', fontsize=9, weight='bold')

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_base_period_working_days_page(self, pdf: PdfPages):
        """Create base period working/non-working days page matching Excel table."""
        _ = self._

        base_period = self.report.get('base_period', {})
        if not self.is_base_period_exists:
            return

        non_working = base_period.get('non_working_days_subtotals', [])
        working = base_period.get('working_days_subtotals', [])
        names = base_period.get('names', [])
        units = base_period.get('units', [])

        if not working or not non_working:
            return
        if sum(working) == 0 and sum(non_working) == 0:
            return

        ca_len = len(names)

        fig, ax = plt.subplots(figsize=self.page_size)
        ax.axis('off')

        # Title
        fig.suptitle(self.name + ' ' + _('Base Period Consumption'),
                     fontsize=16, weight='bold', y=0.98)

        # Table matching Excel
        col_headers = ['', _('Non Working Days') + _('Consumption'),
                       _('Working Days') + _('Consumption')]
        table_data = [col_headers]

        space_working_calendars = self.report.get('space', {}).get('working_calendars', [])

        for i in range(ca_len):
            label = names[i] + ' (' + units[i] + ')'
            nw_val = non_working[i] if i < len(non_working) else 0
            w_val = working[i] if i < len(working) else 0
            nw_display = str(nw_val) if len(space_working_calendars) > 0 and nw_val > 0 else '-'
            w_display = str(w_val) if len(space_working_calendars) > 0 and w_val > 0 else '-'
            table_data.append([label, nw_display, w_display])

        num_cols = len(col_headers)
        col_widths = [0.4, 0.3, 0.3]
        table = ax.table(cellText=table_data, loc='center',
                         cellLoc='center', colWidths=col_widths)
        table.auto_set_font_size(False)
        table.set_fontsize(10)

        # Style header with green
        for j in range(num_cols):
            table[0, j].set_facecolor('#90EE90')
            table[0, j].set_text_props(weight='bold')
        _style_table_borders(table, len(table_data), num_cols)

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_reporting_working_days_page(self, pdf: PdfPages):
        """Create reporting period working/non-working days page matching Excel table."""
        _ = self._

        reporting_period = self.report.get('reporting_period', {})
        non_working = reporting_period.get('non_working_days_subtotals', [])
        working = reporting_period.get('working_days_subtotals', [])
        names = reporting_period.get('names', [])
        units = reporting_period.get('units', [])

        if not working or not non_working:
            return
        if sum(working) == 0 and sum(non_working) == 0:
            return

        ca_len = len(names)

        fig, ax = plt.subplots(figsize=self.page_size)
        ax.axis('off')

        # Title
        fig.suptitle(self.name + ' ' + _('Reporting Period Consumption'),
                     fontsize=16, weight='bold', y=0.98)

        # Table matching Excel
        col_headers = ['', _('Non Working Days') + _('Consumption'),
                       _('Working Days') + _('Consumption')]
        table_data = [col_headers]

        space_working_calendars = self.report.get('space', {}).get('working_calendars', [])

        for i in range(ca_len):
            label = names[i] + ' (' + units[i] + ')'
            nw_val = non_working[i] if i < len(non_working) else 0
            w_val = working[i] if i < len(working) else 0
            nw_display = str(nw_val) if len(space_working_calendars) > 0 and nw_val > 0 else '-'
            w_display = str(w_val) if len(space_working_calendars) > 0 and w_val > 0 else '-'
            table_data.append([label, nw_display, w_display])

        num_cols = len(col_headers)
        col_widths = [0.4, 0.3, 0.3]
        table = ax.table(cellText=table_data, loc='center',
                         cellLoc='center', colWidths=col_widths)
        table.auto_set_font_size(False)
        table.set_fontsize(10)

        # Style header with green
        for j in range(num_cols):
            table[0, j].set_facecolor('#90EE90')
            table[0, j].set_text_props(weight='bold')
        _style_table_borders(table, len(table_data), num_cols)

        plt.tight_layout()
        pdf.savefig(fig)
        plt.close()

    def _create_detailed_data_page(self, pdf: PdfPages):
        """Create detailed data page matching Excel full data table + line charts."""
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

        if not self.is_base_period_exists:
            # No base period: table with Datetime + each category
            times = timestamps[0]
            if len(times) == 0:
                return

            fig = plt.figure(figsize=self.page_size)
            gs_rows = 1 + ca_len  # table + one chart per category
            gs = gridspec.GridSpec(gs_rows, 1, height_ratios=[0.6] + [0.4] * ca_len)
            ax_table = fig.add_subplot(gs[0])
            ax_table.axis('off')

            fig.suptitle(self.name + ' ' + _('Detailed Data'),
                         fontsize=16, weight='bold', y=0.98)

            # Table header
            col_headers = [_('Datetime')]
            for i in range(ca_len):
                col_headers.append(names[i] + ' (' + units[i] + ')')

            table_data = [col_headers]
            for t_idx in range(len(times)):
                row = [times[t_idx]]
                for j in range(ca_len):
                    val = round2(values[j][t_idx], 2) if j < len(values) and t_idx < len(values[j]) else ''
                    row.append(str(val))
                table_data.append(row)

            # Subtotal row
            subtotal_row = [_('Subtotal')]
            for i in range(ca_len):
                subtotal_row.append(str(round2(subtotals[i], 2)) if i < len(subtotals) else '')
            table_data.append(subtotal_row)

            num_cols = len(col_headers)
            col_widths = [0.15] + [0.85 / ca_len] * ca_len
            table = ax_table.table(cellText=table_data, loc='center',
                                   cellLoc='center', colWidths=col_widths)
            table.auto_set_font_size(False)
            table.set_fontsize(7)

            # Style header with green
            for j in range(num_cols):
                table[0, j].set_facecolor('#90EE90')
                table[0, j].set_text_props(weight='bold')
            # Style subtotal row
            last_row = len(table_data) - 1
            for j in range(num_cols):
                table[last_row, j].set_facecolor('#E8EDF5')
                table[last_row, j].set_text_props(weight='bold')
            _style_table_borders(table, len(table_data), num_cols)

            # Line charts - one per category
            for i in range(ca_len):
                ax_chart = fig.add_subplot(gs[1 + i])
                data = values[i] if i < len(values) else []
                ax_chart.plot(range(len(data)), data, marker='o', linewidth=1.5,
                              color='#4472C4', markersize=4, label=names[i])
                ax_chart.fill_between(range(len(data)), data, alpha=0.2, color='#4472C4')
                ax_chart.set_xticks(range(0, len(times), max(1, len(times) // 10)))
                ax_chart.set_xticklabels([times[t][:10] for t in range(0, len(times), max(1, len(times) // 10))],
                                         rotation=45, ha='right', fontsize=7)
                ax_chart.set_ylabel(names[i] + ' (' + units[i] + ')')
                ax_chart.set_title(_('Reporting Period Consumption') + ' - ' + names[i] +
                                   ' (' + units[i] + ')', fontsize=10, weight='bold')
                ax_chart.grid(True, alpha=0.3)

            plt.tight_layout()
            pdf.savefig(fig)
            plt.close()
        else:
            # With base period: table with base + reporting data
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

            fig = plt.figure(figsize=self.page_size)
            gs_rows = 1 + reporting_ca_len  # table + one chart per category
            gs = gridspec.GridSpec(gs_rows, 1, height_ratios=[0.6] + [0.4] * reporting_ca_len)
            ax_table = fig.add_subplot(gs[0])
            ax_table.axis('off')

            fig.suptitle(self.name + ' ' + _('Detailed Data'),
                         fontsize=16, weight='bold', y=0.98)

            # Table header: Base Period - Datetime, Base categories, Reporting Period - Datetime, Reporting categories
            col_headers = [_('Base Period') + ' - ' + _('Datetime')]
            for i in range(base_ca_len):
                col_headers.append(_('Base Period') + ' - ' + base_names[i] + ' (' + base_units[i] + ')')
            col_headers.append(_('Reporting Period') + ' - ' + _('Datetime'))
            for i in range(reporting_ca_len):
                col_headers.append(_('Reporting Period') + ' - ' + names[i] + ' (' + units[i] + ')')

            max_len = max(len(base_times), len(reporting_times))
            table_data = [col_headers]

            for t_idx in range(max_len):
                row = []
                # Base period datetime
                row.append(base_times[t_idx] if t_idx < len(base_times) else '')
                # Base period values
                for j in range(base_ca_len):
                    if t_idx < len(base_values[j]):
                        row.append(str(round2(base_values[j][t_idx], 2)))
                    else:
                        row.append('')
                # Reporting period datetime
                row.append(reporting_times[t_idx] if t_idx < len(reporting_times) else '')
                # Reporting period values
                for j in range(reporting_ca_len):
                    if t_idx < len(values[j]):
                        row.append(str(round2(values[j][t_idx], 2)))
                    else:
                        row.append('')
                table_data.append(row)

            # Subtotal rows
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

            # Style header with green
            for j in range(num_cols):
                table[0, j].set_facecolor('#90EE90')
                table[0, j].set_text_props(weight='bold')
            # Style subtotal row
            last_row = len(table_data) - 1
            for j in range(num_cols):
                table[last_row, j].set_facecolor('#E8EDF5')
                table[last_row, j].set_text_props(weight='bold')
            _style_table_borders(table, len(table_data), num_cols)

            # Line charts - comparing base vs reporting for each category
            for i in range(reporting_ca_len):
                ax_chart = fig.add_subplot(gs[1 + i])
                # Plot reporting period data
                r_data = values[i] if i < len(values) else []
                ax_chart.plot(range(len(r_data)), r_data, marker='o', linewidth=1.5,
                              color='#4472C4', markersize=4,
                              label=_('Reporting Period') + ' - ' + names[i])
                # Plot base period data if available
                if i < len(base_values):
                    b_data = base_values[i]
                    ax_chart.plot(range(len(b_data)), b_data, marker='s', linewidth=1.5,
                                  color='#ED7D31', markersize=4,
                                  label=_('Base Period') + ' - ' + base_names[i])
                ax_chart.set_xticks(range(0, max_len, max(1, max_len // 10)))
                ax_chart.set_xticklabels(
                    [reporting_times[t][:10] if t < len(reporting_times) else ''
                     for t in range(0, max_len, max(1, max_len // 10))],
                    rotation=45, ha='right', fontsize=7)
                ax_chart.set_ylabel(names[i] + ' (' + units[i] + ')')
                ax_chart.set_title(_('Base Period Consumption') + ' / ' + _('Reporting Period Consumption') +
                                   ' - ' + names[i] + ' (' + units[i] + ')', fontsize=9, weight='bold')
                ax_chart.legend(fontsize=7)
                ax_chart.grid(True, alpha=0.3)

            plt.tight_layout()
            pdf.savefig(fig)
            plt.close()

    def _create_parameters_page(self, pdf: PdfPages):
        """Create parameters pages: one page per parameter (table + line chart)."""
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

        # One parameter: table page(s) then line chart on a separate page
        rows_per_table = 50
        for i, name in enumerate(param_names):
            if i >= len(timestamps) or len(timestamps[i]) == 0:
                continue
            if i >= len(values) or len(values[i]) == 0:
                continue

            times = timestamps[i]
            data = values[i]
            data_len = len(times)
            num_sets = (data_len + rows_per_table - 1) // rows_per_table

            # --- Table page(s): full width, multiple sets side by side ---
            fig = plt.figure(figsize=self.page_size)
            fig.suptitle(self.name + ' ' + _('Parameters') + ' - ' + name,
                         fontsize=16, weight='bold', y=0.98)

            gs = gridspec.GridSpec(1, num_sets)

            for s in range(num_sets):
                start_row = s * rows_per_table
                end_row = min(start_row + rows_per_table, data_len)

                ax_tbl = fig.add_subplot(gs[s])
                ax_tbl.axis('off')

                tbl_data = [[_('Time'), name]]
                for j in range(start_row, end_row):
                    tbl_data.append([times[j], str(round2(data[j], 2))])

                tbl = ax_tbl.table(cellText=tbl_data, loc='upper center',
                                   cellLoc='center', colWidths=[0.5, 0.5])
                tbl.auto_set_font_size(False)
                tbl.set_fontsize(6)

                tbl[0, 0].set_facecolor('#90EE90')
                tbl[0, 0].set_text_props(weight='bold')
                tbl[0, 1].set_facecolor('#90EE90')
                tbl[0, 1].set_text_props(weight='bold')
                _style_table_borders(tbl, len(tbl_data), 2)

            plt.tight_layout()
            pdf.savefig(fig)
            plt.close()

            # --- Line chart page: separate page ---
            fig, ax_chart = plt.subplots(figsize=self.page_size)
            ax_chart.plot(range(data_len), data, marker='o', linewidth=1.5,
                          color='#5B9BD5', markersize=4, label=name)
            ax_chart.fill_between(range(data_len), data, alpha=0.2, color='#5B9BD5')

            step = max(1, data_len // 10)
            ax_chart.set_xticks(range(0, data_len, step))
            ax_chart.set_xticklabels([times[t][:10] for t in range(0, data_len, step)],
                                     rotation=45, ha='right', fontsize=7)
            ax_chart.set_ylabel(name)
            ax_chart.set_title(self.name + ' ' + _('Parameters') + ' - ' + name,
                               fontsize=14, weight='bold')
            ax_chart.grid(True, alpha=0.3)

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
