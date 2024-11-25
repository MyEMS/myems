import sys
import telnetlib3
import asyncio
from modbus_tk import modbus_tcp
import byte_swap


########################################################################################################################
# Check connectivity to the host and port
########################################################################################################################
async def check_connectivity(host, port):
    reader, writer = await telnetlib3.open_connection(host, port)
    # Close the connection
    writer.close()


########################################################################################################################
# main procedure
########################################################################################################################
def main():
    if len(sys.argv) > 2:
        host = str(sys.argv[1])
        port = int(sys.argv[2])
    else:
        print('Missing arguments')
        print('Usage: python3 test.py HOST PORT')
        return

    try:
        asyncio.run(check_connectivity(host, port))
        print("Succeeded to telnet {0}:{1}".format(host, port))
    except Exception as e:
        print("Failed to telnet {0}:{1} : {2}".format(host, port, str(e)))
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
        master = modbus_tcp.TcpMaster(host=str(host), port=int(port), timeout_in_sec=5.0)
        master.set_timeout(5.0)
        print("Connected to {0}:{1}".format(host, port))
        print("read registers...")
        result = master.execute(slave=1, function_code=3, starting_address=0, quantity_of_x=1, data_format='>h')
        print("r1 = " + str(result[0]))
        result = master.execute(slave=1, function_code=3, starting_address=1, quantity_of_x=2, data_format='>i')
        print("r2 = " + str(byte_swap.byte_swap_32_bit(result[0])))

        master.close()
    except Exception as e:
        print(str(e))


if __name__ == "__main__":
    main()
