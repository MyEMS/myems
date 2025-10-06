"""
MyEMS Modbus TCP Gateway Service - Test Module

This module provides a simple test utility for verifying Modbus TCP connectivity
and data reading functionality. It can be used to test connections to Modbus TCP
devices and verify that data can be read correctly.

Usage:
    python3 test.py HOST PORT

The test performs the following operations:
1. Tests basic TCP connectivity to the specified host and port
2. Establishes a Modbus TCP connection
3. Reads test data from the Modbus device
4. Demonstrates byte swapping functionality
"""

import sys
import telnetlib3
import asyncio
from modbus_tk import modbus_tcp
import byte_swap


########################################################################################################################
# Check connectivity to the host and port
########################################################################################################################
async def check_connectivity(host, port):
    """
    Test basic TCP connectivity to a host and port.

    This function attempts to establish a TCP connection to verify that the
    target host and port are reachable before attempting Modbus communication.

    Args:
        host: Target hostname or IP address
        port: Target port number

    Raises:
        Exception: If connection fails
    """
    reader, writer = await telnetlib3.open_connection(host, port)
    # Close the connection immediately after establishing it
    writer.close()


########################################################################################################################
# Main test procedure
########################################################################################################################
def main():
    """
    Main test function for Modbus TCP connectivity and data reading.

    This function tests the complete Modbus TCP communication flow:
    1. Validates command line arguments
    2. Tests basic TCP connectivity
    3. Establishes Modbus TCP connection
    4. Reads test data from Modbus registers
    5. Demonstrates byte swapping functionality
    """
    # Validate command line arguments
    if len(sys.argv) > 2:
        host = str(sys.argv[1])
        port = int(sys.argv[2])
    else:
        print('Missing arguments')
        print('Usage: python3 test.py HOST PORT')
        return

    # Test basic TCP connectivity first
    try:
        asyncio.run(check_connectivity(host, port))
        print("Succeeded to telnet {0}:{1}".format(host, port))
    except Exception as e:
        print("Failed to telnet {0}:{1} : {2}".format(host, port, str(e)))
        return

    """
    Python struct module format string documentation:

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

    # Test Modbus TCP communication
    try:
        # Create Modbus TCP master connection
        master = modbus_tcp.TcpMaster(host=str(host), port=int(port), timeout_in_sec=5.0)
        master.set_timeout(5.0)
        print("Connected to {0}:{1}".format(host, port))

        # Read test data from Modbus registers
        print("read registers...")

        # Read 1 register (16-bit) from slave 1, starting address 0, big-endian signed short
        result = master.execute(slave=1, function_code=3, starting_address=0, quantity_of_x=1, data_format='>h')
        print("r1 = " + str(result[0]))

        # Read 2 registers (32-bit) from slave 1, starting address 1, big-endian signed int
        # Then apply byte swapping to demonstrate the byte swap functionality
        result = master.execute(slave=1, function_code=3, starting_address=1, quantity_of_x=2, data_format='>i')
        print("r2 = " + str(byte_swap.byte_swap_32_bit(result[0])))

        # Close the Modbus connection
        master.close()
    except Exception as e:
        print(str(e))


if __name__ == "__main__":
    main()
