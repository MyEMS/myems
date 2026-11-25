"""
MyEMS Modbus RTU Gateway Service - Modbus RTU Client Module

This module provides helper functions for Modbus RTU communication using minimalmodbus.
"""

import minimalmodbus
import serial
from byte_swap import byte_swap_32_bit, byte_swap_64_bit


BYTEORDER_MAP = {
    'BIG': minimalmodbus.BYTEORDER_BIG,
    'LITTLE': minimalmodbus.BYTEORDER_LITTLE,
    'BIG_SWAP': minimalmodbus.BYTEORDER_BIG_SWAP,
    'LITTLE_SWAP': minimalmodbus.BYTEORDER_LITTLE_SWAP,
}


def resolve_byteorder(format_string, byteorder_name=None):
    """
    Resolve minimalmodbus byte order from point address configuration.

    Args:
        format_string: Python struct format string
        byteorder_name: Optional explicit byte order name

    Returns:
        minimalmodbus byte order constant
    """
    if byteorder_name is not None and str(byteorder_name).upper() in BYTEORDER_MAP:
        return BYTEORDER_MAP[str(byteorder_name).upper()]

    if format_string.startswith('<'):
        return minimalmodbus.BYTEORDER_LITTLE
    if format_string.startswith('>'):
        return minimalmodbus.BYTEORDER_BIG

    return minimalmodbus.BYTEORDER_BIG


def create_instrument(connection):
    """
    Create a minimalmodbus Instrument from data source connection settings.

    Args:
        connection: Parsed data source connection JSON object

    Returns:
        Configured minimalmodbus.Instrument instance
    """
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

    return instrument


# No Modbus/serial fault that requires special handling beyond skipping the point.
SERIAL_FAULT_NONE = 'none'
# Soft fault such as no answer or bad CRC: skip the point, reconnect after several in a row.
SERIAL_FAULT_TRANSIENT = 'transient'
# Hard fault such as USB disconnect: reopen the serial port immediately.
SERIAL_FAULT_FATAL = 'fatal'

# Reopen the port after this many consecutive soft faults without a successful read.
TRANSIENT_FAULT_RECONNECT_THRESHOLD = 3


def classify_serial_communication_fault(exc):
    """
    Classify a point-read failure for reconnect policy.

    - SERIAL_FAULT_NONE: slave rejected the request; port is healthy, skip the point.
    - SERIAL_FAULT_TRANSIENT: no answer / bad frame; skip the point, reconnect after
      TRANSIENT_FAULT_RECONNECT_THRESHOLD consecutive soft faults.
    - SERIAL_FAULT_FATAL: serial handle is likely dead; reopen immediately.

    Args:
        exc: Exception raised while reading a point

    Returns:
        One of SERIAL_FAULT_NONE, SERIAL_FAULT_TRANSIENT, SERIAL_FAULT_FATAL
    """
    if isinstance(exc, minimalmodbus.SlaveReportedException):
        return SERIAL_FAULT_NONE

    if isinstance(exc, serial.SerialException):
        return SERIAL_FAULT_FATAL

    message = str(exc).lower()
    fatal_markers = (
        'disconnected',
        'multiple access',
        'input/output error',
        'device not configured',
        'no such device',
        'device not found',
        'could not open port',
        'port is closed',
    )
    if any(marker in message for marker in fatal_markers):
        return SERIAL_FAULT_FATAL

    if isinstance(exc, minimalmodbus.MasterReportedException):
        return SERIAL_FAULT_TRANSIENT

    transient_markers = (
        'timed out',
        'timeout',
        'no answer',
        'no communication',
        'checksum error',
        'too short',
        'local echo',
    )
    if any(marker in message for marker in transient_markers):
        return SERIAL_FAULT_TRANSIENT

    return SERIAL_FAULT_NONE


def release_instrument(instrument, port):
    """
    Close the serial port and drop minimalmodbus's cached port object.

    minimalmodbus keeps one Serial instance per port name. Closing it without
    removing that cache makes the next Instrument reuse a handle that is
    already dead after a USB disconnect.

    Args:
        instrument: minimalmodbus Instrument instance
        port: Serial port path used to create the instrument
    """
    serial_port = getattr(instrument, 'serial', None)
    cached_ports = getattr(minimalmodbus, '_serialports', None)
    cached = None
    if isinstance(cached_ports, dict):
        cached = cached_ports.get(port)

    for candidate in (serial_port, cached):
        if candidate is None:
            continue
        try:
            candidate.close()
        except Exception:
            pass

    if isinstance(cached_ports, dict):
        cached_ports.pop(port, None)


def read_point_value(instrument, address, default_slaveaddress):
    """
    Read a point value from a Modbus RTU slave.

    Args:
        instrument: minimalmodbus Instrument instance
        address: Parsed point address JSON object
        default_slaveaddress: Default slave address from data source connection

    Returns:
        Numeric point value

    Raises:
        Exception: If the read operation fails
    """
    slave_id = address.get('slave_id', default_slaveaddress)
    registeraddress = address['offset']
    function_code = address['function_code']
    number_of_registers = address['number_of_registers']
    format_string = address['format']
    byteorder = resolve_byteorder(format_string, address.get('byteorder'))

    instrument.address = slave_id

    if function_code in (1, 2):
        if number_of_registers <= 1:
            return instrument.read_bit(registeraddress, functioncode=function_code)
        return instrument.read_bits(registeraddress, number_of_bits=number_of_registers,
                                      functioncode=function_code)

    if 'f' in format_string and number_of_registers == 2:
        value = instrument.read_float(
            registeraddress,
            functioncode=function_code,
            number_of_registers=number_of_registers,
            byteorder=byteorder
        )
    elif 'd' in format_string and number_of_registers == 4:
        value = instrument.read_float(
            registeraddress,
            functioncode=function_code,
            number_of_registers=number_of_registers,
            byteorder=byteorder
        )
    elif number_of_registers == 2:
        signed = format_string.endswith('i') or format_string.endswith('l')
        value = instrument.read_long(
            registeraddress,
            functioncode=function_code,
            signed=signed,
            byteorder=byteorder
        )
    else:
        signed = format_string.endswith('h') or format_string.endswith('i')
        number_of_decimals = address.get('number_of_decimals', 0)
        value = instrument.read_register(
            registeraddress,
            number_of_decimals=number_of_decimals,
            functioncode=function_code,
            signed=signed
        )

    if address['byte_swap']:
        if number_of_registers == 2:
            value = byte_swap_32_bit(value)
        elif number_of_registers == 4:
            value = byte_swap_64_bit(value)

    return value
