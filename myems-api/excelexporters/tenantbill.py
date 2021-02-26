import base64
import uuid
import os
import datetime
from openpyxl.chart import (
    PieChart,
    BarChart,
    Reference,
)
from openpyxl.styles import PatternFill, Border, Side, Alignment, Font
from decimal import Decimal
from openpyxl.drawing.image import Image
from openpyxl import Workbook
from openpyxl.chart.label import DataLabelList


####################################################################################################################
# PROCEDURES
# Step 1: Validate the report data
# Step 2: Generate excel file
# Step 3: Encode the excel file bytes to Base64
####################################################################################################################


def export(report,
           name,
           reporting_start_datetime_local,
           reporting_end_datetime_local,
           period_type):
    ####################################################################################################################
    # Step 1: Validate the report data
    ####################################################################################################################
    if report is None:
        return None
    print(report)

    ####################################################################################################################
    # Step 2: Generate excel file from the report data
    ####################################################################################################################
    filename = generate_excel(report,
                              name,
                              reporting_start_datetime_local,
                              reporting_end_datetime_local,
                              period_type)
    ####################################################################################################################
    # Step 3: Encode the excel file to Base64
    ####################################################################################################################
    try:
        with open(filename, 'rb') as binary_file:
            binary_file_data = binary_file.read()
    except IOError as ex:
        pass

    # Base64 encode the bytes
    base64_encoded_data = base64.b64encode(binary_file_data)
    # get the Base64 encoded data using human-readable characters.
    base64_message = base64_encoded_data.decode('utf-8')
    # delete the file from server
    try:
        os.remove(filename)
    except NotImplementedError as ex:
        pass
    return base64_message


def generate_excel(report,
                   name,
                   reporting_start_datetime_local,
                   reporting_end_datetime_local,
                   period_type):
    wb = Workbook()
    ws = wb.active

    # Row height
    for i in range(1, 11 + 1):
        ws.row_dimensions[i].height = 0.1
    ws.row_dimensions[12].height = 30.0
    ws.row_dimensions[13].height = 10.0
    ws.merge_cells('B13:I13')
    for i in range(14, 23 + 1):
        ws.row_dimensions[i].height = 0.1
    ws.row_dimensions[24].height = 20.0
    ws.row_dimensions[25].height = 10.0
    ws.merge_cells('B25:I25')
    for i in range(26, 35 + 1):
        ws.row_dimensions[i].height = 0.1
    for i in range(36, 41 + 1):
        ws.row_dimensions[i].height = 20.0
    ws.row_dimensions[42].height = 10.0
    ws.merge_cells('B42:I42')
    for i in range(43, 52 + 1):
        ws.row_dimensions[i].height = 0.1

    # Col width
    ws.column_dimensions['A'].width = 1.5
    for i in range(ord('B'), ord('J')):
        ws.column_dimensions[chr(i)].width = 16
    ws.column_dimensions['J'].width = 1.5

    # merge cell
    ws.merge_cells('C12:H12')

    ws.merge_cells('C24:I24')

    # Font
    notice_font = Font(name='宋体', size=20, bold=True)
    name_font = Font(name='Constantia', size=12, bold=True)
    title_font = Font(name='宋体', size=11, bold=True)
    data_font = Font(name='Franklin Gothic Book', size=11)

    table_fill = PatternFill(fill_type='solid', fgColor='1F497D')
    f_border = Border(left=Side(border_style='medium', color='00000000'),
                      right=Side(border_style='medium', color='00000000'),
                      bottom=Side(border_style='medium', color='00000000'),
                      top=Side(border_style='medium', color='00000000')
                      )
    b_border = Border(
        bottom=Side(border_style='medium', color='00000000'),
    )

    b_c_alignment = Alignment(vertical='bottom',
                              horizontal='center',
                              text_rotation=0,
                              wrap_text=False,
                              shrink_to_fit=False,
                              indent=0)
    c_c_alignment = Alignment(vertical='center',
                              horizontal='center',
                              text_rotation=0,
                              wrap_text=False,
                              shrink_to_fit=False,
                              indent=0)
    b_r_alignment = Alignment(vertical='bottom',
                              horizontal='right',
                              text_rotation=0,
                              wrap_text=False,
                              shrink_to_fit=False,
                              indent=0)
    c_r_alignment = Alignment(vertical='bottom',
                              horizontal='center',
                              text_rotation=0,
                              wrap_text=False,
                              shrink_to_fit=False,
                              indent=0)
    b_l_alignment = Alignment(vertical='bottom',
                              horizontal='left',
                              text_rotation=0,
                              wrap_text=False,
                              shrink_to_fit=False,
                              indent=0)

    ws['C12'].font = notice_font
    ws['C12'].alignment = c_c_alignment
    ws['C12'] = '付款通知书'

    # img
    img = Image("excelexporters/myemslogo.png")
    img.width = 117
    img.height = 117
    ws.add_image(img, 'I12')

    has_lease_number_data_flag = True
    if "tenant" not in report.keys() or \
            report['tenant'] is None or \
            'lease_number' not in report['tenant'].keys() or \
            report['tenant']['lease_number'] is None:
        has_lease_number_data_flag = False
        ws.row_dimensions[24].height = 0.1

    if has_lease_number_data_flag:
        ws['B24'].font = name_font
        ws['B24'].alignment = b_r_alignment
        ws['B24'] = '租赁合同号码:'
        ws['C24'].alignment = b_l_alignment
        ws['C24'].font = name_font
        ws['C24'] = report['tenant']['lease_number']

    has_tenant_data_flag = True
    if "tenant" not in report.keys() or \
            report['tenant'] is None:
        has_tenant_data_flag = False
        for i in range(36, 41 + 1):
            ws.row_dimensions[i].height = 0.1

    if has_tenant_data_flag:
        report_tenant_data = report['tenant']
        for i in range(36, 41 + 1):
            ws.merge_cells('C{}:D{}'.format(i, i))
            ws['C' + str(i)].alignment = b_l_alignment
            ws['C' + str(i)].font = name_font

        ws['C36'] = report_tenant_data['name']
        ws.merge_cells('E36:I36')

        ws['C37'] = report_tenant_data['rooms']

        ws['C38'] = report_tenant_data['floors']

        ws['C39'] = report_tenant_data['buildings']

        ws['C40'] = report_tenant_data['email']

        ws['C41'] = report_tenant_data['phone']

        for i in range(37, 41 + 1):
            ws.merge_cells('E{}:G{}'.format(i, i))
            ws.merge_cells('H{}:I{}'.format(i, i))
            ws['E' + str(i)].alignment = b_r_alignment
            ws['E' + str(i)].font = name_font
            ws['H' + str(i)].alignment = b_l_alignment
            ws['H' + str(i)].font = name_font

        ws['E37'] = '账单号码:'
        ws['E38'] = '租赁合同号码:'
        ws['E39'] = '账单日期:'
        ws['E40'] = '付款到期日:'
        ws['E41'] = '应付款金额:'

        # Simulated data
        ws['H37'] = ''
        ws['H38'] = report_tenant_data['lease_number']
        ws['H39'] = datetime.datetime.strptime(reporting_start_datetime_local, '%Y-%m-%dT%H:%M:%S').strftime('%Y-%m-%d')
        ws['H40'] = datetime.datetime.strptime(reporting_end_datetime_local, '%Y-%m-%dT%H:%M:%S').strftime('%Y-%m-%d')
        ws['H41'] = report['reporting_period']['currency_unit'] + \
            str(round(report['reporting_period']['total_cost']
                      if 'reporting_period' in report.keys()
                         and 'total_cost' in report['reporting_period'].keys()
                         and report['reporting_period']['total_cost'] is not None
                      else 0, 2))

    has_reporting_period_data_flag = True

    if 'reporting_period' not in report.keys() \
            or report['reporting_period'] is None:
        has_reporting_period_data_flag = False

    if has_reporting_period_data_flag:
        ws.row_dimensions[53].height = 25.0
        for i in range(ord('B'), ord('J')):
            ws[chr(i) + '53'].fill = table_fill
            ws[chr(i) + '53'].font = title_font
            ws[chr(i) + '53'].alignment = c_c_alignment
            ws[chr(i) + '53'].border = f_border

        ws['B53'] = '能耗分类'
        ws['C53'] = '结算期开始日期'
        ws['D53'] = '结算期结束日期'
        ws['E53'] = '数量'
        ws['F53'] = '单位'
        ws['G53'] = '金额'
        ws['H53'] = '税率'
        ws['I53'] = '税额'

        reporting_period_data = report['reporting_period']
        names = reporting_period_data['names']
        ca_len = len(names) if names is not None else 0

        for i in range(54, 54 + ca_len):
            ws.row_dimensions[i].height = 20.0
            for j in range(ord('B'), ord('J')):
                ws[chr(j) + str(i)].font = title_font
                ws[chr(j) + str(i)].alignment = c_c_alignment
                ws[chr(j) + str(i)].border = f_border

                if chr(j) == 'B':
                    ws[chr(j) + str(i)] = reporting_period_data['names'][i - 54]
                elif chr(j) == 'C':
                    ws[chr(j) + str(i)] = datetime.datetime.strptime(reporting_start_datetime_local,
                                                                     '%Y-%m-%dT%H:%M:%S').strftime('%Y-%m-%d')
                elif chr(j) == 'D':
                    ws[chr(j) + str(i)] = datetime.datetime.strptime(reporting_end_datetime_local,
                                                                     '%Y-%m-%dT%H:%M:%S').strftime('%Y-%m-%d')
                elif chr(j) == 'E':
                    ws[chr(j) + str(i)] = round(reporting_period_data['subtotals_input'][i - 54], 3)
                elif chr(j) == 'F':
                    ws[chr(j) + str(i)] = reporting_period_data['units'][i - 54]
                elif chr(j) == 'G':
                    ws[chr(j) + str(i)] = round(reporting_period_data['subtotals_cost'][i - 54], 2)
                elif chr(j) == 'H':
                    # Simulated data
                    ws[chr(j) + str(i)] = 0
                elif chr(j) == 'I':
                    # Simulated data
                    ws[chr(j) + str(i)] = 0

        ws.row_dimensions[54 + ca_len].height = 10.0
        ws.merge_cells('B{}:H{}'.format((54 + ca_len), (54 + ca_len)))

        current_row_number = 54 + ca_len + 1
        for i in range(current_row_number, current_row_number + 3):
            ws.row_dimensions[i].height = 20.0
            ws['B' + str(i)].alignment = b_r_alignment
            ws['B' + str(i)].font = name_font
            ws['H' + str(i)].alignment = b_l_alignment
            ws['H' + str(i)].font = name_font
            ws.merge_cells('B{}:G{}'.format(i, i))
            ws.merge_cells('H{}:I{}'.format(i, i))

        ws['B' + str(current_row_number)] = '小计:'
        ws['H' + str(current_row_number)] = report['reporting_period']['currency_unit'] + str(
            round(report['reporting_period']['total_cost']
                  if 'reporting_period' in report.keys()
                     and 'total_cost' in report['reporting_period'].keys()
                     and report['reporting_period']['total_cost'] is not None
                  else 0, 2))

        current_row_number += 1

        # Simulated data
        taxes = Decimal(0.00)

        ws['B' + str(current_row_number)] = '增值税销项税金:'
        ws['H' + str(current_row_number)] = report['reporting_period']['currency_unit'] + str(round(taxes, 2))

        current_row_number += 1

        ws['B' + str(current_row_number)] = '应付金额合计:'
        ws['H' + str(current_row_number)] = report['reporting_period']['currency_unit'] + str(
            round(report['reporting_period']['total_cost'] + taxes
                  if 'reporting_period' in report.keys()
                     and 'total_cost' in report['reporting_period'].keys()
                     and report['reporting_period']['total_cost'] is not None
                  else 0 + taxes, 2))

    filename = str(uuid.uuid4()) + '.xlsx'
    wb.save(filename)

    return filename
