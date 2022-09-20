import base64
import uuid
import os
from decimal import Decimal
from openpyxl.styles import PatternFill, Border, Side, Alignment, Font
from openpyxl.drawing.image import Image
from openpyxl import Workbook
import gettext


########################################################################################################################
# PROCEDURES
# Step 1: Validate the report data
# Step 2: Generate excelexporters file
# Step 3: Encode the excelexporters file to Base64
########################################################################################################################

def export(result, space_name, reporting_start_datetime_local, reporting_end_datetime_local, language):
    ####################################################################################################################
    # Step 1: Validate the report data
    ####################################################################################################################
    if result is None:
        return None

    ####################################################################################################################
    # Step 2: Generate excel file from the report data
    ####################################################################################################################
    filename = generate_excel(result,
                              space_name,
                              reporting_start_datetime_local,
                              reporting_end_datetime_local,
                              language)
    ####################################################################################################################
    # Step 3: Encode the excel file to Base64
    ####################################################################################################################
    binary_file_data = b''
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


def generate_excel(report, space_name, reporting_start_datetime_local, reporting_end_datetime_local, language):

    locale_path = './i18n/'
    if language == 'zh_CN':
        trans = gettext.translation('myems', locale_path, languages=['zh_CN'])
    elif language == 'de':
        trans = gettext.translation('myems', locale_path, languages=['de'])
    elif language == 'en':
        trans = gettext.translation('myems', locale_path, languages=['en'])
    else:
        trans = gettext.translation('myems', locale_path, languages=['en'])
    trans.install()
    _ = trans.gettext

    wb = Workbook()
    ws = wb.active
    ws.title = "MeterTracking"

    # Column width
    for i in range(ord('A'), ord('I')):
        ws.column_dimensions[chr(i)].width = 25.0

    # Head image
    ws.row_dimensions[1].height = 105
    img = Image("excelexporters/myems.png")
    ws.add_image(img, 'A1')

    # Query Parameters
    b_r_alignment = Alignment(vertical='bottom',
                              horizontal='right',
                              text_rotation=0,
                              wrap_text=True,
                              shrink_to_fit=False,
                              indent=0)
    ws['A3'].alignment = b_r_alignment
    ws['A3'] = _('Space') + ':'
    ws['B3'] = space_name
    ws['A4'].alignment = b_r_alignment
    ws['A4'] = _('Start Datetime') + ':'
    ws['B4'] = reporting_start_datetime_local
    ws['A5'].alignment = b_r_alignment
    ws['A5'] = _('End Datetime') + ':'
    ws['B5'] = reporting_end_datetime_local
    ws['A6'].alignment = b_r_alignment
    ws['A6'] = _('Start Integrity Rate') + ':'
    ws['B6'] = (str(report['start_integrity_rate'] * Decimal(100.0)) + '%') \
        if report['start_integrity_rate'] is not None else None
    ws['A7'].alignment = b_r_alignment
    ws['A7'] = _('End Integrity Rate') + ':'
    ws['B7'] = (str(report['end_integrity_rate'] * Decimal(100.0)) + '%') \
        if report['end_integrity_rate'] is not None else None
    ws['A8'].alignment = b_r_alignment
    ws['A8'] = _('Full Integrity Rate') + ':'
    ws['B8'] = (str(report['full_integrity_rate'] * Decimal(100.0)) + '%') \
        if report['full_integrity_rate'] is not None else None

    # Title
    title_font = Font(size=12, bold=True)
    ws['A9'].font = title_font
    ws['A9'] = _('ID')
    ws['B9'].font = title_font
    ws['B9'] = _('Name')
    ws['C9'].font = title_font
    ws['C9'] = _('Space')
    ws['D9'].font = title_font
    ws['D9'] = _('Cost Center')
    ws['E9'].font = title_font
    ws['E9'] = _('Energy Category')
    ws['F9'].font = title_font
    ws['F9'] = _('Description')
    ws['G9'].font = title_font
    ws['G9'] = _('Start Value')
    ws['H9'].font = title_font
    ws['H9'] = _('End Value')

    current_row_number = 10
    for i in range(0, len(report['meters'])):
        ws['A' + str(current_row_number)] = report['meters'][i]['id']
        ws['B' + str(current_row_number)] = report['meters'][i]['meter_name']
        ws['C' + str(current_row_number)] = report['meters'][i]['space_name']
        ws['D' + str(current_row_number)] = report['meters'][i]['cost_center_name']
        ws['E' + str(current_row_number)] = report['meters'][i]['energy_category_name']
        ws['F' + str(current_row_number)] = report['meters'][i]['description']
        ws['G' + str(current_row_number)] = report['meters'][i]['start_value']
        ws['H' + str(current_row_number)] = report['meters'][i]['end_value']
        current_row_number += 1

    filename = str(uuid.uuid4()) + '.xlsx'
    wb.save(filename)

    return filename
