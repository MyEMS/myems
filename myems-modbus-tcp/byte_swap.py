import struct
########################################################################################################################
# Swap adjacent bytes
# This is not big-endian and little-endian swapping.
########################################################################################################################


# swap adjacent bytes of 32bits (4bytes) data,
# abcd => badc
def byte_swap_32_bit(x):
    x_type = type(x)
    if x_type is float:
        x = struct.unpack('>I', struct.pack('>f', x))[0]

    a = ((x >> 8) & 0x00FF0000)
    b = ((x << 8) & 0xFF000000)
    c = ((x >> 8) & 0x000000FF)
    d = ((x << 8) & 0x0000FF00)

    if x_type is float:
        return struct.unpack('>f', struct.pack('>I', b | a | d | c))[0]
    else:
        return b | a | d | c


# swap adjacent bytes of 64bits (8bytes) data,
# abcdefgh => badcfehg
def byte_swap_64_bit(x):
    x_type = type(x)
    if x_type is float:
        x = struct.unpack('>Q', struct.pack('>d', x))[0]

    a = ((x >> 8) & 0x00FF000000000000)
    b = ((x << 8) & 0xFF00000000000000)
    c = ((x >> 8) & 0x000000FF00000000)
    d = ((x << 8) & 0x0000FF0000000000)
    e = ((x >> 8) & 0x0000000000FF0000)
    f = ((x << 8) & 0x00000000FF000000)
    g = ((x >> 8) & 0x00000000000000FF)
    h = ((x << 8) & 0x000000000000FF00)

    if x_type is float:
        return struct.unpack('>d', struct.pack('>Q', b | a | d | c | f | e | h | g))[0]
    else:
        return b | a | d | c | f | e | h | g
