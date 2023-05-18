import sys
import telnetlib3
import asyncio

from modbus_tk import modbus_tcp

import byte_swap


def main():
    if len(sys.argv) > 1:
        host = sys.argv[1]
    else:
        print('Usage: python3 test.py HOST_IP_ADDR ')
        return

    port = 502
    try:
        asyncio.run(connect_and_close(host, port))
        print("Succeeded to telnet %s:%s ", host, port)
    except Exception as e:
        print("Failed to telnet %s:%s : %s  ", host, port, str(e))
        return

    """
    Functions to convert between Python values and C structs.
    Python bytes objects are used to hold the data representing the C struct
    and also as format strings (explained below) to describe the layout of data
    in the C struct.

    The optional first format char indicates byte order, size and alignment:
      @: native order, size & alignment (default)
      =: native order, std. size & alignment
      <: little-endian, std. size & alignment
      >: big-endian, std. size & alignment
      !: same as >

    The remaining chars indicate types of args and must match exactly;
    these can be preceded by a decimal repeat count:
      x: pad byte (no data); c:char; b:signed byte; B:unsigned byte;
      ?: _Bool (requires C99; if not available, char is used instead)
      h:short; H:unsigned short; i:int; I:unsigned int;
      l:long; L:unsigned long; f:float; d:double.
    Special cases (preceding decimal count indicates length):
      s:string (array of char); p: pascal string (with count byte).
    Special cases (only available in native format):
      n:ssize_t; N:size_t;
      P:an integer type that is wide enough to hold a pointer.
    Special case (not in native mode unless 'long long' in platform C):
      q:long long; Q:unsigned long long
    Whitespace between formats is ignored.

    The variable struct.error is an exception raised on errors.
    """
    try:
        master = modbus_tcp.TcpMaster(host=host, port=port, timeout_in_sec=5.0)
        master.set_timeout(5.0)
        print("Connected to %s:%s ", host, port)
        print("read registers...")
        result = master.execute(slave=1, function_code=3, starting_address=6401, quantity_of_x=2, data_format='<l')
        print("51AL1-1-KWHimp = " + str(byte_swap.byte_swap_32_bit(result[0])))
        result = master.execute(slave=1, function_code=3, starting_address=6403, quantity_of_x=2, data_format='<l')
        print("51AL2-1-KWHimp = " + str(byte_swap.byte_swap_32_bit(result[0])))
        result = master.execute(slave=1, function_code=3, starting_address=6405, quantity_of_x=2, data_format='<l')
        print("51AL3-1-KWHimp = " + str(byte_swap.byte_swap_32_bit(result[0])))
        result = master.execute(slave=1, function_code=3, starting_address=6407, quantity_of_x=2, data_format='<l')
        print("51AL4-1-KWHimp  = " + str(byte_swap.byte_swap_32_bit(result[0])))
        result = master.execute(slave=1, function_code=3, starting_address=6409, quantity_of_x=2, data_format='<l')
        print("51AL5-1-KWHimp = " + str(byte_swap.byte_swap_32_bit(result[0])))
        # result = master.execute(slave=1, function_code=3, starting_address=11, quantity_of_x=2, data_format='>f')
        # print("Volatage Vc-a = " + str(result))
        # result = master.execute(slave=1, function_code=3, starting_address=13, quantity_of_x=2, data_format='>f')
        # print("Current a     = " + str(result))
        # result = master.execute(slave=1, function_code=3, starting_address=15, quantity_of_x=2, data_format='>f')
        # print("Current b     = " + str(result))
        # result = master.execute(slave=1, function_code=3, starting_address=17, quantity_of_x=2, data_format='>f')
        # print("Current c     = " + str(result))
        # result = master.execute(slave=1, function_code=3, starting_address=19, quantity_of_x=2, data_format='>f')
        # print("Active Power a = " + str(result))
        # result = master.execute(slave=1, function_code=3, starting_address=25, quantity_of_x=2, data_format='>f')
        # print("Active Power b = " + str(result))
        # result = master.execute(slave=1, function_code=3, starting_address=27, quantity_of_x=2, data_format='>f')
        # print("Active Power c = " + str(result))
        # result = master.execute(slave=1, function_code=3, starting_address=29, quantity_of_x=2, data_format='>f')
        # print("Total Active Power = " + str(result))
        # result = master.execute(slave=1, function_code=3, starting_address=65, quantity_of_x=2, data_format='>f')
        # print("Total Power Factor = " + str(result))
        # result = master.execute(slave=1, function_code=3, starting_address=71, quantity_of_x=2, data_format='>f')
        # print("Amplitude Unbalance - Volatage = " + str(result))
        # result = master.execute(slave=1, function_code=3, starting_address=73, quantity_of_x=2, data_format='>f')
        # print("Amplitude Unbalance - Current = " + str(result))
        # result = master.execute(slave=1, function_code=3, starting_address=801, quantity_of_x=4, data_format='>d')
        # print("Active Energy Import Tariff 1 = " + str(result))
        master.close()
    except Exception as e:
        print(str(e))


async def connect_and_close(host, port):
    reader, writer = await telnetlib3.open_connection(host, port)
    # Close the connection
    writer.close()


if __name__ == "__main__":
    main()
