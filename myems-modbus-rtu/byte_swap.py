"""
MyEMS Modbus TCP Gateway Service - Byte Swap Utilities Module

This module provides byte swapping functions for handling Modbus TCP data formats.
Some Modbus devices transmit data with adjacent bytes swapped, which requires
correction before the data can be properly interpreted.

The byte swapping functions handle:
- 32-bit (4-byte) data: swaps adjacent bytes (abcd => badc)
- 64-bit (8-byte) data: swaps adjacent bytes (abcdefgh => badcfehg)

Note: This is NOT big-endian/little-endian byte order swapping, but rather
swapping of adjacent byte pairs within the data structure.

These functions are used when the Modbus device configuration specifies
byte_swap = true in the point address configuration.
"""

import struct

########################################################################################################################
# Byte Swapping Functions
# These functions swap adjacent bytes within data structures
# This is NOT big-endian and little-endian swapping, but adjacent byte pair swapping
########################################################################################################################


def byte_swap_32_bit(x):
    """
    Swap adjacent bytes of 32-bit (4-byte) data.

    Transforms data from format: abcd => badc
    This is used when Modbus devices transmit 32-bit values with adjacent bytes swapped.

    Args:
        x: Input value (int or float) to be byte-swapped

    Returns:
        Byte-swapped value of the same type as input
    """
    x_type = type(x)

    # Handle float values by converting to integer representation first
    if x_type is float:
        x = struct.unpack('>I', struct.pack('>f', x))[0]

    # Extract and swap adjacent bytes using bitwise operations
    # Original: abcd (where a,b,c,d are bytes)
    # Result:   badc
    a = ((x >> 8) & 0x00FF0000)   # Extract byte a, shift to position b
    b = ((x << 8) & 0xFF000000)   # Extract byte b, shift to position a
    c = ((x >> 8) & 0x000000FF)   # Extract byte c, shift to position d
    d = ((x << 8) & 0x0000FF00)   # Extract byte d, shift to position c

    # Reconstruct the value with swapped bytes
    if x_type is float:
        # Convert back to float if input was float
        return struct.unpack('>f', struct.pack('>I', b | a | d | c))[0]
    else:
        # Return integer result
        return b | a | d | c


def byte_swap_64_bit(x):
    """
    Swap adjacent bytes of 64-bit (8-byte) data.

    Transforms data from format: abcdefgh => badcfehg
    This is used when Modbus devices transmit 64-bit values with adjacent bytes swapped.

    Args:
        x: Input value (int or float) to be byte-swapped

    Returns:
        Byte-swapped value of the same type as input
    """
    x_type = type(x)

    # Handle float values by converting to integer representation first
    if x_type is float:
        x = struct.unpack('>Q', struct.pack('>d', x))[0]

    # Extract and swap adjacent bytes using bitwise operations
    # Original: abcdefgh (where a,b,c,d,e,f,g,h are bytes)
    # Result:   badcfehg
    a = ((x >> 8) & 0x00FF000000000000)   # Extract byte a, shift to position b
    b = ((x << 8) & 0xFF00000000000000)   # Extract byte b, shift to position a
    c = ((x >> 8) & 0x000000FF00000000)   # Extract byte c, shift to position d
    d = ((x << 8) & 0x0000FF0000000000)   # Extract byte d, shift to position c
    e = ((x >> 8) & 0x0000000000FF0000)   # Extract byte e, shift to position f
    f = ((x << 8) & 0x00000000FF000000)   # Extract byte f, shift to position e
    g = ((x >> 8) & 0x00000000000000FF)   # Extract byte g, shift to position h
    h = ((x << 8) & 0x000000000000FF00)   # Extract byte h, shift to position g

    # Reconstruct the value with swapped bytes
    if x_type is float:
        # Convert back to float if input was float
        return struct.unpack('>d', struct.pack('>Q', b | a | d | c | f | e | h | g))[0]
    else:
        # Return integer result
        return b | a | d | c | f | e | h | g
