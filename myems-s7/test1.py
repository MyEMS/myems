import sys
import telnetlib
import snap7
from snap7.snap7types import S7AreaPE, S7AreaMK, S7AreaCT, S7AreaTM


def main():
    if len(sys.argv) > 2:
        host = sys.argv[1]
        port = int(sys.argv[2])
    else:
        print('Usage: python3 test0.py IP PORT ')
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
        s7_client.connect(address=host, rack=0, slot=2, tcpport=port)

    except Exception as e:
        print("S7 Client Connection error : " + str(e))
        if s7_client.get_connected():
            s7_client.disconnect()
            s7_client.destroy()
        return

    try:
        print("cpu_state:" + s7_client.get_cpu_state())
        cpu_info = s7_client.get_cpu_info()
        print("ModuleTypeName:" + str(cpu_info.ModuleTypeName))
        print("SerialNumber:" + str(cpu_info.SerialNumber))
        print("ASName:" + str(cpu_info.ASName))
        print("Copyright:" + str(cpu_info.Copyright))
        print("ModuleName:" + str(cpu_info.ModuleName))
    except Exception as e:
        print("S7 Client get_block_info error : " + str(e))

    try:
        reading = s7_client.read_area(area=S7AreaPE, dbnumber=0, start=0, size=1)
        print('AHU-1 = ' + str(snap7.util.get_bool(reading, byte_index=0, bool_index=0)))
        print('AHU-2 = ' + str(snap7.util.get_bool(reading, byte_index=0, bool_index=1)))
        print('AHU-3 = ' + str(snap7.util.get_bool(reading, byte_index=0, bool_index=2)))
        print('AHU-4 = ' + str(snap7.util.get_bool(reading, byte_index=0, bool_index=3)))
        print('AHU-5 = ' + str(snap7.util.get_bool(reading, byte_index=0, bool_index=4)))
        print('AHU-6 = ' + str(snap7.util.get_bool(reading, byte_index=0, bool_index=5)))
        print('AHU-7 = ' + str(snap7.util.get_bool(reading, byte_index=0, bool_index=6)))
        print('AHU-8 = ' + str(snap7.util.get_bool(reading, byte_index=0, bool_index=7)))
    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    try:
        reading = s7_client.read_area(area=S7AreaPE, dbnumber=0, start=320, size=2)
        print(str(reading))
        print('PIW320 = ' + str(snap7.util.get_int(reading, byte_index=0)))

    except Exception as e:
        print("S7 Client read_area error : " + str(e))

    if s7_client.get_connected():
        s7_client.disconnect()
        s7_client.destroy()


if __name__ == "__main__":
    main()
