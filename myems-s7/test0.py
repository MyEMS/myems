import sys
import telnetlib
import struct
import snap7
from snap7.snap7types import S7AreaDB


def main():
    if len(sys.argv) > 3:
        host = sys.argv[1]
        port = int(sys.argv[2])
        db_number = int(sys.argv[3])
    else:
        print('Usage: python3 test0.py HOST PORT DB_NUMBER ')
        return

    try:
        telnetlib.Telnet(host, port, 10)
        print("Succeeded to telnet %s:%s in acquisition process ", host, port)
    except Exception as e:
        print("Failed to telnet %s:%s in acquisition process: %s  ", host, port, str(e))
        return

    s7_client = None
    try:
        s7_client = snap7.client.Client()
        s7_client.connect(host, 0, 2, port)
    except Exception as e:
        print("S7 Client Connection error : " + str(e))
        if s7_client.get_connected():
            s7_client.disconnect()
            s7_client.destroy()
        return

    try:
        # print(client.get_cpu_state())
        # print(client.get_cpu_info())
        # print(client.list_blocks_of_type(snap7))

        print(s7_client.get_block_info('DB', db_number))
    except Exception as e:
        print("S7 Client get_block_info error : " + str(e))

    try:
        # Machine Status(Int)
        print('Machine Status     = ' + str(snap7.util.get_int(s7_client.read_area(S7AreaDB, db_number, 1, 2), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # User Status(Short)
        data = s7_client.read_area(S7AreaDB, db_number, 3, 1)[0:1]
        data[0] = data[0] & 0xff
        packed = struct.pack('B', *data)
        value = struct.unpack('>B', packed)[0]
        print('User Status        = ' + str(value))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Production(Int)
        print('Production         = ' + str(snap7.util.get_int(s7_client.read_area(S7AreaDB, db_number, 4, 2), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Active Energy(REAL) wh
        print('Active Energy      = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 6, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Current_L1(REAL)
        print('Current_L1         = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 10, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Current_L2(REAL)
        print('Current_L2         = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 14, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Current_L3(REAL)
        print('Current_L3         = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 18, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Voltage_L1-L2(REAL)
        print('Voltage_L1-L2      = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 22, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Voltage_L2-L3(REAL)
        print('Voltage_L2-L3      = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 26, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Voltage_L3-L1(REAL)
        print('Voltage_L3-L1      = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 30, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # TotalActivePower(REAL)
        print('TotalActivePower   = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 34, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # TotalReactivePower(REAL)
        print('TotalReactivePower = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 38, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # TotalApparentPower(REAL)
        print('TotalApparentPower = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 42, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Apparent Energy(REAL)
        print('Apparent Energy    = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 46, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Power factor L1(REAL)
        print('Power factor L1    = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 50, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Power factor L2(REAL)
        print('Power factor L2    = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 54, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Power factor L3(REAL)
        print('Power factor L3    = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 58, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Total Power factor (REAL)
        print('Total Power factor = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 62, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Unbalance Voltage
        print('Unbalance Voltage  = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 66, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        # Unbalance Current
        print('Unbalance Current  = ' + str(snap7.util.get_real(s7_client.read_area(S7AreaDB, db_number, 70, 4), 0)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    if s7_client.get_connected():
        s7_client.disconnect()
        s7_client.destroy()


if __name__ == "__main__":
    main()
