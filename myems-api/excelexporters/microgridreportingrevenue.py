"""
Microgrid Reporting Revenue Excel Exporter

This module provides functionality to export microgrid revenue reporting data to Excel format.
It generates comprehensive reports showing microgrid revenue performance
with detailed analysis and visualizations.

Key Features:
- Microgrid revenue performance analysis
- Base period vs reporting period comparison
- Formatted Excel output with proper styling
- Multi-language support
- Base64 encoding for file transmission

The exported Excel file includes:
- Microgrid revenue performance summary
- Base period comparison data
- Proper formatting and borders
- Logo and header information
"""

import base64
from core.utilities import get_translation
import os
import uuid
from openpyxl import Workbook


########################################################################################################################
# PROCEDURES
# Step 1: Validate the report data
# Step 2: Generate excel file from the report data
# Step 3: Encode the excel file to Base64
########################################################################################################################

def export(report, name, reporting_start_datetime_local, reporting_end_datetime_local, base_period_start_datetime,
           base_period_end_datetime, period_type, language):
    ####################################################################################################################
    # Step 1: Validate the report data
    ####################################################################################################################
    if report is None:
        return None

    ####################################################################################################################
    # Step 2: Generate excel file from the report data
    ####################################################################################################################
    filename = generate_excel(report,
                              name,
                              reporting_start_datetime_local,
                              reporting_end_datetime_local,
                              base_period_start_datetime,
                              base_period_end_datetime,
                              period_type,
                              language)
    ####################################################################################################################
    # Step 3: Encode the excel file to Base64
    ####################################################################################################################
    binary_file_data = b''
    try:
        with open(filename, 'rb') as binary_file:
            binary_file_data = binary_file.read()
    except IOError as ex:
        print(str(ex))

    # Base64 encode the bytes
    base64_encoded_data = base64.b64encode(binary_file_data)
    # get the Base64 encoded data using human-readable characters.
    base64_message = base64_encoded_data.decode('utf-8')
    # delete the file from server
    try:
        os.remove(filename)
    except NotImplementedError as ex:
        print(str(ex))
    return base64_message


def generate_excel(report, name, reporting_start_datetime_local, reporting_end_datetime_local,
                   base_period_start_datetime, base_period_end_datetime, period_type, language):
    trans = get_translation(language)
    trans.install()
    _ = trans.gettext

    wb = Workbook()
    ws = wb.active
    ws.title = "Microgrid Reporting"
    # todo add microgrid reproting data
    filename = str(uuid.uuid4()) + '.xlsx'
    wb.save(filename)

    return filename
