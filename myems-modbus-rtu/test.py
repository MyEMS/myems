"""
MyEMS Modbus RTU Gateway Service - Test Module

Usage:
    python3 test.py PORT SLAVE_ID REGISTER FUNCTION_CODE [FORMAT] [REGISTERS]

Example:
    python3 test.py /dev/ttyUSB0 1 8192 4 >f 2
"""

import sys
import minimalmodbus
from modbus_rtu_client import read_point_value


def main():
    if len(sys.argv) > 3:
        port = str(sys.argv[1])
        slave_id = int(sys.argv[2])
        registeraddress = int(sys.argv[3], 0)
    else:
        print('Missing arguments')
        print('Usage: python3 test.py PORT SLAVE_ID REGISTER FUNCTION_CODE [FORMAT] [REGISTERS]')
        return

    function_code = int(sys.argv[4]) if len(sys.argv) > 4 else 4
    format_string = sys.argv[5] if len(sys.argv) > 5 else '>f'
    number_of_registers = int(sys.argv[6]) if len(sys.argv) > 6 else 2

    connection = {
        'port': port,
        'slaveaddress': slave_id,
        'baudrate': 9600,
        'bytesize': 8,
        'parity': 'N',
        'stopbits': 1,
        'timeout': 0.2,
        'write_timeout': 2.0,
        'mode': 'rtu',
        'close_port_after_each_call': False,
        'interval_in_seconds': 60
    }

    address = {
        'slave_id': slave_id,
        'function_code': function_code,
        'offset': registeraddress,
        'number_of_registers': number_of_registers,
        'format': format_string,
        'byte_swap': False
    }

    instrument = minimalmodbus.Instrument(
        port=connection['port'],
        slaveaddress=connection['slaveaddress'],
        mode=connection['mode'],
        close_port_after_each_call=connection['close_port_after_each_call']
    )
    instrument.serial.baudrate = connection['baudrate']
    instrument.serial.parity = connection['parity']
    instrument.serial.bytesize = connection['bytesize']
    instrument.serial.stopbits = connection['stopbits']
    instrument.serial.timeout = connection['timeout']
    instrument.serial.write_timeout = connection['write_timeout']

    try:
        value = read_point_value(instrument, address, connection['slaveaddress'])
        print("Register 0x{0:X} value = {1}".format(registeraddress, value))
    except Exception as e:
        print(str(e))


if __name__ == "__main__":
    main()
