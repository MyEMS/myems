"""
Tenant Bill PDF Exporter

This module provides functionality to export the tenant bill (payment notice)
to PDF format.

The exported PDF file includes:
- Cover page with report metadata
- Payment notice page (logo, lease number, tenant contact block, bill header,
  billing detail table and the subtotal / VAT / total amount payable footer)

Note: the content mirrors the Excel exporter (excelexporters/tenantbill.py)
exactly - the same columns, the same rows and the same 2-decimal precision
(3 decimals for the quantity column). The Excel bill has no chart, so neither
has the PDF.
"""

import base64
import datetime
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


def _to_date_str(datetime_str):
    """Convert 'YYYY-MM-DDTHH:MM:SS' to 'YYYY-MM-DD', keep the input on failure."""
    if not datetime_str:
        return ''
    try:
        return datetime.datetime.strptime(datetime_str, '%Y-%m-%dT%H:%M:%S').isoformat()[0:10]
    except Exception:
        return str(datetime_str)[0:10]


class TenantBillPDFExporter:
    """
    Export tenant bill (payment notice) data to PDF format.
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

        # Page settings - A4 portrait
        self.page_size = (8.27, 11.69)
        self.dpi = 80

        # Color scheme
        self.colors = {
            'table_header': '#90EE90',
            'table_alternate': '#E8EDF5',
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
        logger.info("Starting PDF generation for tenant bill")

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
        logger.info(f"PDF generation completed in {elapsed:.2f}s")
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
        self.period_type = period_type

        with PdfPages(filename) as pdf:
            # Cover page
            self._create_cover_page(pdf)

            # Payment notice page(s)
            self._create_payment_notice_pages(pdf)

        logger.info(f"PDF generated: {filename}")
        return filename

    def _create_cover_page(self, pdf: PdfPages):
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

        # Title - _('Tenant Data') + ' - ' + _('Tenant Bill')
        fig.text(0.5, 0.50, _('Tenant Data') + ' - ' + _('Tenant Bill'),
                 fontsize=24, weight='bold', ha='center', va='center')

        # Info list
        info_data = [
            [_('Tenant') + ':', self.name],
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

    def _build_detail_rows(self):
        """Build the billing detail rows exactly like the Excel exporter does."""
        _ = self._
        reporting_period = self.report.get('reporting_period') or {}
        names = reporting_period.get('names') or []
        units = reporting_period.get('units') or []
        subtotals_input = reporting_period.get('subtotals_input') or []
        subtotals_cost = reporting_period.get('subtotals_cost') or []

        start_date = _to_date_str(self.reporting_start)
        end_date = _to_date_str(self.reporting_end)

        col_headers = [_('Energy Category'), _('Billing Period Start'), _('Billing Period End'),
                       _('Quantity'), _('Unit'), _('Amount'), _('Tax Rate'), _('VAT Output Tax')]

        rows = []
        for i in range(len(names)):
            quantity = subtotals_input[i] if i < len(subtotals_input) else None
            amount = subtotals_cost[i] if i < len(subtotals_cost) else None
            rows.append([
                str(names[i]),
                start_date,
                end_date,
                str(round2(quantity, 3)) if quantity is not None else '',
                str(units[i]) if i < len(units) else '',
                str(round2(amount, 2)) if amount is not None else '',
                # Simulated data, same as the Excel exporter
                '0',
                '0',
            ])
        return col_headers, rows

    def _create_payment_notice_pages(self, pdf: PdfPages):
        """Create the payment notice page (and continuation pages for the table)."""
        _ = self._

        tenant_data = self.report.get('tenant') or {}
        reporting_period = self.report.get('reporting_period') or {}
        currency_unit = reporting_period.get('currency_unit') or ''
        total_cost = reporting_period.get('total_cost')
        total_cost = round2(total_cost, 2) if total_cost is not None else round2(0, 2)
        # Simulated data, same as the Excel exporter
        taxes = round2(0, 2)

        col_headers, detail_rows = self._build_detail_rows()
        total_cols = len(col_headers)
        col_widths = [0.17, 0.12, 0.12, 0.11, 0.09, 0.13, 0.10, 0.16]
        sum_w = sum(col_widths)
        col_widths = [w / sum_w for w in col_widths]

        # The first page carries the notice header, so it holds fewer rows
        first_page_rows = 22
        other_page_rows = 30

        pages = []
        if not detail_rows:
            pages.append([])
        else:
            pages.append(detail_rows[0:first_page_rows])
            offset = first_page_rows
            while offset < len(detail_rows):
                pages.append(detail_rows[offset:offset + other_page_rows])
                offset += other_page_rows

        page_total = len(pages)
        for page_index, page_rows in enumerate(pages):
            fig = plt.figure(figsize=self.page_size)

            if page_index == 0:
                self._draw_notice_header(fig, tenant_data, currency_unit,
                                         total_cost, taxes)
                table_rect = [0.05, 0.30, 0.90, 0.44]
                footer_rect = [0.05, 0.10, 0.90, 0.16]
            else:
                fig.text(0.5, 0.955, _('Payment Notice'),
                         fontsize=16, weight='bold', ha='center', va='center')
                fig.text(0.5, 0.925, self.name + ' (' + _('Tenant Bill') + ')',
                         fontsize=9, ha='center', va='center', color='#555555')
                table_rect = [0.05, 0.20, 0.90, 0.69]
                footer_rect = [0.05, 0.03, 0.90, 0.14]

            table_data = [col_headers] + page_rows
            # Stretch the table only when the page is actually full, otherwise a bill
            # with a few energy categories would get absurdly tall rows
            max_rows = (first_page_rows if page_index == 0 else other_page_rows) + 1
            fill_ratio = min(1.0, float(len(table_data)) / max_rows)
            ax_tbl = fig.add_axes(table_rect)
            ax_tbl.axis('off')
            # bbox is (x, y, width, height) in axes coordinates, anchor the block to the
            # top of the axes and let its height follow the number of rows
            tbl = ax_tbl.table(cellText=table_data, loc='upper center',
                               cellLoc='center', colWidths=col_widths,
                               bbox=[0, 1 - fill_ratio, 1, fill_ratio])
            tbl.auto_set_font_size(False)
            tbl.set_fontsize(7)
            for j in range(total_cols):
                tbl[0, j].set_facecolor(self.colors['table_header'])
                tbl[0, j].set_text_props(weight='bold')
            for i in range(2, len(table_data), 2):
                for j in range(total_cols):
                    tbl[i, j].set_facecolor(self.colors['table_alternate'])
            _style_table_borders(tbl, len(table_data), total_cols)

            is_last = page_index == page_total - 1
            self._draw_notice_footer(fig, footer_rect, currency_unit,
                                     total_cost, taxes, is_last)

            pdf.savefig(fig)
            plt.close()

    def _draw_notice_header(self, fig, tenant_data, currency_unit, total_cost, taxes):
        """Draw the payment notice title, logo, lease number and contact block."""
        _ = self._

        # Logo at the top right corner
        img_path = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                                '..', 'excelexporters', 'myemslogo.png')
        if os.path.exists(img_path):
            try:
                img = plt.imread(img_path)
                img_h_inch = 1.2
                img_w_inch = img_h_inch * img.shape[1] / max(1, img.shape[0])
                page_w, page_h = self.page_size
                ax_img = fig.add_axes([0.95 - img_w_inch / page_w,
                                       0.94 - img_h_inch / page_h,
                                       img_w_inch / page_w,
                                       img_h_inch / page_h])
                ax_img.imshow(img)
                ax_img.axis('off')
            except Exception as e:
                logger.warning(f"Failed to load logo image: {e}")

        fig.text(0.42, 0.945, _('Payment Notice'),
                 fontsize=20, weight='bold', ha='center', va='center')

        lease_number = tenant_data.get('lease_number')
        if lease_number:
            fig.text(0.05, 0.905, _('Lease Number') + ': ' + str(lease_number),
                     fontsize=11, weight='bold', ha='left', va='center')

        # Tenant contact block (left) and bill block (right), same fields as Excel
        left_rows = [
            str(tenant_data.get('name', '') or ''),
            str(tenant_data.get('rooms', '') or ''),
            str(tenant_data.get('floors', '') or ''),
            str(tenant_data.get('buildings', '') or ''),
            str(tenant_data.get('email', '') or ''),
            str(tenant_data.get('phone', '') or ''),
        ]
        right_rows = [
            [_('Bill Number'), ''],
            [_('Lease Contract Number'), str(lease_number or '')],
            [_('Bill Date'), _to_date_str(self.reporting_start)],
            [_('Payment Due Date'), _to_date_str(self.reporting_end)],
            [_('Amount Payable'), currency_unit + str(total_cost)],
        ]

        ax_left = fig.add_axes([0.03, 0.735, 0.44, 0.16])
        ax_left.axis('off')
        tbl_left = ax_left.table(cellText=[[v] for v in left_rows], loc='upper left',
                                 cellLoc='left', colWidths=[1.0], bbox=[0, 0, 1, 1])
        tbl_left.auto_set_font_size(False)
        tbl_left.set_fontsize(9)
        for i in range(len(left_rows)):
            tbl_left[i, 0].set_edgecolor('white')
            tbl_left[i, 0].set_linewidth(0)

        ax_right = fig.add_axes([0.50, 0.735, 0.47, 0.16])
        ax_right.axis('off')
        tbl_right = ax_right.table(cellText=right_rows, loc='upper right',
                                   cellLoc='left', colWidths=[0.55, 0.45], bbox=[0, 0, 1, 1])
        tbl_right.auto_set_font_size(False)
        tbl_right.set_fontsize(9)
        for i in range(len(right_rows)):
            for j in [0, 1]:
                tbl_right[i, j].set_edgecolor('white')
                tbl_right[i, j].set_linewidth(0)
            tbl_right[i, 0].set_text_props(ha='right', weight='bold')

    def _draw_notice_footer(self, fig, rect, currency_unit, total_cost, taxes, is_last):
        """Draw the subtotal / VAT / total amount payable footer block."""
        _ = self._

        footer_rows = [
            [_('Subtotal') + ':', currency_unit + str(total_cost)],
            [_('VAT Output Tax') + ':', currency_unit + str(taxes)],
            [_('Total Amount Payable') + ':', currency_unit + str(round2(total_cost + taxes, 2))],
        ]

        ax = fig.add_axes(rect)
        ax.axis('off')
        tbl = ax.table(cellText=footer_rows, loc='upper right',
                       cellLoc='left', colWidths=[0.6, 0.4], bbox=[0.3, 0.55, 0.7, 0.45])
        tbl.auto_set_font_size(False)
        tbl.set_fontsize(10)
        for i in range(len(footer_rows)):
            for j in [0, 1]:
                tbl[i, j].set_edgecolor('white')
                tbl[i, j].set_linewidth(0)
            tbl[i, 0].set_text_props(ha='right')
            tbl[i, 1].set_text_props(weight='bold')


# Convenience function keeping the same interface as the Excel exporter
def export(report, name, reporting_start_datetime_local,
           reporting_end_datetime_local, period_type, language):
    """
    Export report data to PDF and return base64 encoded string.
    This function maintains the same interface as the Excel exporter.
    """
    exporter = TenantBillPDFExporter(language)
    return exporter.export(report, name,
                           reporting_start_datetime_local,
                           reporting_end_datetime_local,
                           period_type,
                           language)
