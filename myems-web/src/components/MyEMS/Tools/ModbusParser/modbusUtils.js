// Pure Modbus frame parsing helpers for the Modbus Parser tool.
// No UI or i18n dependencies so this module stays unit-testable.

export const PROTOCOL_OPTIONS = [
  { value: 'rtu', label: 'Modbus RTU' },
  { value: 'tcp', label: 'Modbus TCP' },
  { value: 'raw', label: 'Raw Register Data' }
];

export const DIRECTION_OPTIONS = [
  { value: 'request', label: 'Request' },
  { value: 'response', label: 'Response' }
];

// The four common ways a 32-bit value is assembled from two 16-bit registers.
export const BYTE_ORDERS = [
  { value: 'ABCD', label: 'ABCD (Big-endian)' },
  { value: 'BADC', label: 'BADC (Byte swap)' },
  { value: 'CDAB', label: 'CDAB (Word swap)' },
  { value: 'DCBA', label: 'DCBA (Little-endian)' }
];

const FUNCTION_NAMES = {
  0x01: 'Read Coils',
  0x02: 'Read Discrete Inputs',
  0x03: 'Read Holding Registers',
  0x04: 'Read Input Registers',
  0x05: 'Write Single Coil',
  0x06: 'Write Single Register',
  0x08: 'Diagnostics',
  0x0f: 'Write Multiple Coils',
  0x10: 'Write Multiple Registers',
  0x17: 'Read/Write Multiple Registers',
  0x2b: 'Encapsulated Interface'
};

const EXCEPTION_NAMES = {
  0x01: 'Illegal Function',
  0x02: 'Illegal Data Address',
  0x03: 'Illegal Data Value',
  0x04: 'Server Device Failure',
  0x05: 'Acknowledge',
  0x06: 'Server Device Busy',
  0x08: 'Memory Parity Error',
  0x0a: 'Gateway Path Unavailable',
  0x0b: 'Gateway Target Device Failed to Respond'
};

export const getFunctionName = code => FUNCTION_NAMES[code] || 'Unknown Function';

export const getExceptionName = code => EXCEPTION_NAMES[code] || 'Unknown Exception';

const hex2 = value => value.toString(16).padStart(2, '0').toUpperCase();

const hex4 = value => value.toString(16).padStart(4, '0').toUpperCase();

const toHex = bytes =>
  bytes
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');

// Split a 16-bit value into four 4-bit groups, e.g. 0064 -> "0000 0000 0110 0100".
const toBinary = value =>
  value
    .toString(2)
    .padStart(16, '0')
    .replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');

const u16 = (bytes, offset) => (bytes[offset] << 8) | bytes[offset + 1];

const signed16 = value => (value & 0x8000 ? value - 0x10000 : value);

// Standard Modbus CRC-16 (polynomial 0xA001, initial value 0xFFFF).
export const crc16Modbus = bytes => {
  let crc = 0xffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit += 1) {
      if (crc & 1) crc = (crc >> 1) ^ 0xa001;
      else crc >>= 1;
    }
  }
  return crc;
};

// Append the little-endian CRC to a frame body (used to build sample frames
// whose checksum is guaranteed to be correct).
export const withCrc = body => {
  const crc = crc16Modbus(body);
  return body.concat([crc & 0xff, (crc >> 8) & 0xff]);
};

// Accepts "01 03 00 00", "01,03", "0x0103", "01030000" and similar.
export const normalizeHex = input => {
  const raw = typeof input === 'string' ? input : '';
  const cleaned = raw.replace(/0x|0X/g, '').replace(/[^0-9a-fA-F]/g, '');
  if (!cleaned) return { ok: false, code: 'empty' };
  if (cleaned.length % 2 !== 0) return { ok: false, code: 'odd' };
  if (cleaned.length > 512) return { ok: false, code: 'tooLong' };
  const bytes = [];
  for (let i = 0; i < cleaned.length; i += 2) {
    bytes.push(parseInt(cleaned.substr(i, 2), 16));
  }
  return { ok: true, bytes, text: toHex(bytes) };
};

const buildRegisters = (raw, startAddress) => {
  const registers = [];
  for (let i = 0; i + 1 < raw.length; i += 2) {
    const value = (raw[i] << 8) | raw[i + 1];
    registers.push({
      address: startAddress + i / 2,
      raw: [raw[i], raw[i + 1]],
      hex: toHex([raw[i], raw[i + 1]]),
      bin: toBinary(value),
      uint16: value,
      int16: signed16(value)
    });
  }
  return registers;
};

const buildCoils = (bits, startAddress, count) => {
  const limit = Math.min(count, bits.length * 8);
  const coils = [];
  for (let i = 0; i < limit; i += 1) {
    const byte = bits[Math.floor(i / 8)];
    coils.push({ address: startAddress + i, on: ((byte >> (i % 8)) & 1) === 1 });
  }
  return coils;
};

// Parse the protocol data unit (function code + payload).
const parsePdu = (fc, data, direction, ctx) => {
  const out = {
    segments: [],
    registers: [],
    coils: [],
    warnings: [],
    extraMeta: [],
    exceptionCode: null
  };

  const need = length => {
    if (data.length >= length) return true;
    out.warnings.push({ code: 'dataTooShort' });
    return false;
  };

  // Exception response: the high bit of the function code is set.
  if (fc & 0x80) {
    if (!need(1)) return out;
    out.exceptionCode = data[0];
    out.segments.push({ label: 'Exception Code', hex: toHex(data.slice(0, 1)), tone: 'error' });
    return out;
  }

  switch (fc) {
    case 0x01:
    case 0x02: {
      if (direction === 'request') {
        if (!need(4)) break;
        const start = u16(data, 0);
        const quantity = u16(data, 2);
        out.segments.push({ label: 'Start Address', hex: toHex(data.slice(0, 2)), tone: 'data' });
        out.segments.push({ label: 'Quantity', hex: toHex(data.slice(2, 4)), tone: 'data' });
        out.extraMeta.push({ label: 'Start Address', value: String(start) });
        out.extraMeta.push({ label: 'Quantity', value: String(quantity) });
      } else {
        if (!need(1)) break;
        const byteCount = data[0];
        const bits = data.slice(1, 1 + byteCount);
        out.segments.push({ label: 'Byte Count', hex: toHex(data.slice(0, 1)), tone: 'data' });
        if (bits.length) out.segments.push({ label: 'Coil Data', hex: toHex(bits), tone: 'data' });
        out.extraMeta.push({ label: 'Byte Count', value: String(byteCount) });
        const count = ctx.coilQuantity || bits.length * 8;
        if (count > bits.length * 8) out.warnings.push({ code: 'coilQuantityExceeds' });
        out.coils = buildCoils(bits, ctx.startAddress, count);
        out.extraMeta.push({ label: 'Coil Count', value: String(out.coils.length) });
      }
      break;
    }
    case 0x03:
    case 0x04: {
      if (direction === 'request') {
        if (!need(4)) break;
        const start = u16(data, 0);
        const quantity = u16(data, 2);
        out.segments.push({ label: 'Start Address', hex: toHex(data.slice(0, 2)), tone: 'data' });
        out.segments.push({ label: 'Quantity', hex: toHex(data.slice(2, 4)), tone: 'data' });
        out.extraMeta.push({ label: 'Start Address', value: String(start) });
        out.extraMeta.push({ label: 'Quantity', value: String(quantity) });
      } else {
        if (!need(1)) break;
        const byteCount = data[0];
        const payload = data.slice(1, 1 + byteCount);
        out.segments.push({ label: 'Byte Count', hex: toHex(data.slice(0, 1)), tone: 'data' });
        if (payload.length) out.segments.push({ label: 'Register Data', hex: toHex(payload), tone: 'data' });
        out.extraMeta.push({ label: 'Byte Count', value: String(byteCount) });
        out.registers = buildRegisters(payload, ctx.startAddress);
        out.extraMeta.push({ label: 'Register Count', value: String(out.registers.length) });
        if (payload.length % 2) out.warnings.push({ code: 'oddRegisterBytes' });
      }
      break;
    }
    case 0x05:
    case 0x06: {
      if (!need(4)) break;
      const address = u16(data, 0);
      const value = u16(data, 2);
      out.segments.push({ label: 'Address', hex: toHex(data.slice(0, 2)), tone: 'data' });
      out.segments.push({ label: 'Value', hex: toHex(data.slice(2, 4)), tone: 'data' });
      out.extraMeta.push({ label: 'Address', value: String(address) });
      if (fc === 0x05) {
        let state = 'Invalid';
        if (value === 0xff00) state = 'ON';
        else if (value === 0x0000) state = 'OFF';
        else out.warnings.push({ code: 'invalidCoilValue' });
        out.extraMeta.push({
          label: 'Coil State',
          value: state,
          tone: state === 'Invalid' ? 'danger' : undefined
        });
      } else {
        out.registers = buildRegisters(data.slice(2, 4), address);
        out.extraMeta.push({ label: 'Register Value', value: String(value) });
      }
      break;
    }
    case 0x0f: {
      if (direction === 'request') {
        if (!need(5)) break;
        const start = u16(data, 0);
        const quantity = u16(data, 2);
        const byteCount = data[4];
        const bits = data.slice(5, 5 + byteCount);
        out.segments.push({ label: 'Start Address', hex: toHex(data.slice(0, 2)), tone: 'data' });
        out.segments.push({ label: 'Quantity', hex: toHex(data.slice(2, 4)), tone: 'data' });
        out.segments.push({ label: 'Byte Count', hex: toHex(data.slice(4, 5)), tone: 'data' });
        if (bits.length) out.segments.push({ label: 'Coil Data', hex: toHex(bits), tone: 'data' });
        out.extraMeta.push({ label: 'Start Address', value: String(start) });
        out.extraMeta.push({ label: 'Quantity', value: String(quantity) });
        out.extraMeta.push({ label: 'Byte Count', value: String(byteCount) });
        out.coils = buildCoils(bits, start, quantity);
      } else {
        if (!need(4)) break;
        const start = u16(data, 0);
        const quantity = u16(data, 2);
        out.segments.push({ label: 'Start Address', hex: toHex(data.slice(0, 2)), tone: 'data' });
        out.segments.push({ label: 'Quantity', hex: toHex(data.slice(2, 4)), tone: 'data' });
        out.extraMeta.push({ label: 'Start Address', value: String(start) });
        out.extraMeta.push({ label: 'Quantity', value: String(quantity) });
      }
      break;
    }
    case 0x10: {
      if (direction === 'request') {
        if (!need(5)) break;
        const start = u16(data, 0);
        const quantity = u16(data, 2);
        const byteCount = data[4];
        const payload = data.slice(5, 5 + byteCount);
        out.segments.push({ label: 'Start Address', hex: toHex(data.slice(0, 2)), tone: 'data' });
        out.segments.push({ label: 'Quantity', hex: toHex(data.slice(2, 4)), tone: 'data' });
        out.segments.push({ label: 'Byte Count', hex: toHex(data.slice(4, 5)), tone: 'data' });
        if (payload.length) out.segments.push({ label: 'Register Data', hex: toHex(payload), tone: 'data' });
        out.extraMeta.push({ label: 'Start Address', value: String(start) });
        out.extraMeta.push({ label: 'Quantity', value: String(quantity) });
        out.extraMeta.push({ label: 'Byte Count', value: String(byteCount) });
        out.registers = buildRegisters(payload, start);
        if (payload.length % 2) out.warnings.push({ code: 'oddRegisterBytes' });
      } else {
        if (!need(4)) break;
        const start = u16(data, 0);
        const quantity = u16(data, 2);
        out.segments.push({ label: 'Start Address', hex: toHex(data.slice(0, 2)), tone: 'data' });
        out.segments.push({ label: 'Quantity', hex: toHex(data.slice(2, 4)), tone: 'data' });
        out.extraMeta.push({ label: 'Start Address', value: String(start) });
        out.extraMeta.push({ label: 'Quantity', value: String(quantity) });
      }
      break;
    }
    default: {
      if (data.length) out.segments.push({ label: 'Data', hex: toHex(data), tone: 'data' });
      if (getFunctionName(fc) === 'Unknown Function') out.warnings.push({ code: 'unknownFunction' });
      break;
    }
  }

  return out;
};

const parseRaw = (bytes, ctx) => {
  if (bytes.length % 2 !== 0) return { ok: false, errors: [{ code: 'rawOdd' }], warnings: [] };
  const registers = buildRegisters(bytes, ctx.startAddress);
  return {
    ok: true,
    errors: [],
    warnings: [],
    protocol: 'raw',
    direction: null,
    frameLength: bytes.length,
    meta: [
      { label: 'Protocol', value: 'Raw Register Data' },
      { label: 'Register Count', value: String(registers.length) }
    ],
    crc: null,
    segments: [{ label: 'Register Data', hex: toHex(bytes), tone: 'data' }],
    registers,
    coils: []
  };
};

const parseRtuFrame = (bytes, direction, ctx) => {
  if (bytes.length < 4) return { ok: false, errors: [{ code: 'rtuTooShort' }], warnings: [] };

  const body = bytes.slice(0, bytes.length - 2);
  // The RTU checksum is transmitted low byte first.
  const frameCrc = (bytes[bytes.length - 1] << 8) | bytes[bytes.length - 2];
  const computedCrc = crc16Modbus(body);
  const crcMatch = frameCrc === computedCrc;

  const slave = bytes[0];
  const fc = bytes[1];
  const pdu = parsePdu(fc, bytes.slice(2, bytes.length - 2), direction, ctx);

  const meta = [
    { label: 'Protocol', value: 'Modbus RTU' },
    { label: 'Data Direction', value: direction === 'request' ? 'Request' : 'Response' },
    { label: 'Slave Address', value: String(slave) },
    { label: 'Function Code', value: `0x${hex2(fc)}`, tone: pdu.exceptionCode ? 'danger' : undefined },
    {
      label: 'Function Description',
      value: pdu.exceptionCode ? 'Exception Response' : getFunctionName(fc),
      tone: pdu.exceptionCode ? 'danger' : undefined
    }
  ];
  if (pdu.exceptionCode) {
    meta.push({ label: 'Exception Code', value: `0x${hex2(pdu.exceptionCode)}`, tone: 'danger' });
    meta.push({ label: 'Exception Description', value: getExceptionName(pdu.exceptionCode), tone: 'danger' });
  }
  meta.push(...pdu.extraMeta);
  meta.push({ label: 'Frame CRC', value: `0x${hex4(frameCrc)}` });
  meta.push({ label: 'Computed CRC', value: `0x${hex4(computedCrc)}` });
  meta.push({ label: 'CRC Check', value: crcMatch ? 'Passed' : 'Failed', tone: crcMatch ? 'success' : 'danger' });

  return {
    ok: true,
    errors: [],
    warnings: pdu.warnings,
    protocol: 'rtu',
    direction,
    frameLength: bytes.length,
    crc: { frame: `0x${hex4(frameCrc)}`, computed: `0x${hex4(computedCrc)}`, match: crcMatch },
    meta,
    segments: [
      { label: 'Slave Address', hex: toHex(bytes.slice(0, 1)), tone: 'slave' },
      { label: 'Function Code', hex: toHex(bytes.slice(1, 2)), tone: 'function' },
      ...pdu.segments,
      { label: 'CRC', hex: toHex(bytes.slice(bytes.length - 2)), tone: crcMatch ? 'crc' : 'error' }
    ],
    registers: pdu.registers,
    coils: pdu.coils
  };
};

const parseTcpFrame = (bytes, direction, ctx) => {
  if (bytes.length < 8) return { ok: false, errors: [{ code: 'tcpTooShort' }], warnings: [] };

  const transactionId = u16(bytes, 0);
  const protocolId = u16(bytes, 2);
  const lengthField = u16(bytes, 4);
  const unitId = bytes[6];
  const fc = bytes[7];
  const pduData = bytes.slice(8);
  const actualLength = bytes.length - 6;

  const warnings = [];
  if (protocolId !== 0) warnings.push({ code: 'tcpProtocolIdInvalid', params: { id: `0x${hex4(protocolId)}` } });
  if (lengthField !== actualLength) {
    warnings.push({ code: 'tcpLengthMismatch', params: { field: lengthField, actual: actualLength } });
  }

  const pdu = parsePdu(fc, pduData, direction, ctx);

  const meta = [
    { label: 'Protocol', value: 'Modbus TCP' },
    { label: 'Data Direction', value: direction === 'request' ? 'Request' : 'Response' },
    { label: 'Transaction ID', value: `0x${hex4(transactionId)}` },
    {
      label: 'Protocol ID',
      value: `0x${hex4(protocolId)}`,
      tone: protocolId === 0 ? 'success' : 'danger'
    },
    { label: 'Length', value: String(lengthField) },
    { label: 'Unit ID', value: String(unitId) },
    { label: 'Function Code', value: `0x${hex2(fc)}`, tone: pdu.exceptionCode ? 'danger' : undefined },
    {
      label: 'Function Description',
      value: pdu.exceptionCode ? 'Exception Response' : getFunctionName(fc),
      tone: pdu.exceptionCode ? 'danger' : undefined
    }
  ];
  if (pdu.exceptionCode) {
    meta.push({ label: 'Exception Code', value: `0x${hex2(pdu.exceptionCode)}`, tone: 'danger' });
    meta.push({ label: 'Exception Description', value: getExceptionName(pdu.exceptionCode), tone: 'danger' });
  }
  meta.push(...pdu.extraMeta);

  return {
    ok: true,
    errors: [],
    warnings: warnings.concat(pdu.warnings),
    protocol: 'tcp',
    direction,
    frameLength: bytes.length,
    crc: null,
    meta,
    segments: [
      { label: 'Transaction ID', hex: toHex(bytes.slice(0, 2)), tone: 'header' },
      { label: 'Protocol ID', hex: toHex(bytes.slice(2, 4)), tone: protocolId === 0 ? 'header' : 'error' },
      { label: 'Length', hex: toHex(bytes.slice(4, 6)), tone: 'header' },
      { label: 'Unit ID', hex: toHex(bytes.slice(6, 7)), tone: 'slave' },
      { label: 'Function Code', hex: toHex(bytes.slice(7, 8)), tone: 'function' },
      ...pdu.segments
    ],
    registers: pdu.registers,
    coils: pdu.coils
  };
};

export const parseFrame = ({ hexText, protocol, direction, startAddress, coilQuantity }) => {
  const normalized = normalizeHex(hexText);
  if (!normalized.ok) return { ok: false, errors: [{ code: normalized.code }], warnings: [] };

  const ctx = {
    startAddress: Number.isFinite(startAddress) && startAddress > 0 ? startAddress : 0,
    coilQuantity: Number.isFinite(coilQuantity) && coilQuantity > 0 ? coilQuantity : null
  };

  if (protocol === 'raw') return parseRaw(normalized.bytes, ctx);
  if (protocol === 'tcp') return parseTcpFrame(normalized.bytes, direction, ctx);
  return parseRtuFrame(normalized.bytes, direction, ctx);
};

// Decode the 32-bit interpretations of two consecutive registers using the
// selected byte order. Returns null when there is no second register.
export const decodeWide = (reg0, reg1, order) => {
  if (!reg0 || !reg1) return null;
  const bytes = [reg0.raw[0], reg0.raw[1], reg1.raw[0], reg1.raw[1]];
  const arranged = {
    ABCD: [bytes[0], bytes[1], bytes[2], bytes[3]],
    BADC: [bytes[1], bytes[0], bytes[3], bytes[2]],
    CDAB: [bytes[2], bytes[3], bytes[0], bytes[1]],
    DCBA: [bytes[3], bytes[2], bytes[1], bytes[0]]
  }[order];
  if (!arranged) return null;
  const buffer = new Uint8Array(arranged).buffer;
  const view = new DataView(buffer);
  return {
    uint32: view.getUint32(0),
    int32: view.getInt32(0),
    float32: view.getFloat32(0)
  };
};

// Compact rendering for float32 values; falls back to a dash for NaN/Infinity.
export const formatFloat = value => {
  if (!Number.isFinite(value)) return '-';
  return Number(value.toPrecision(6)).toString();
};
