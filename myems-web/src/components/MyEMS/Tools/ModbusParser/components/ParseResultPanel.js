import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Badge, Button, Input, Table } from 'reactstrap';
import { BYTE_ORDERS, decodeWide, formatFloat } from '../modbusUtils';

// Left border colour per byte segment role, matching the Falcon palette.
const SEGMENT_COLORS = {
  header: '#6c7a8f',
  slave: '#2c7be5',
  function: '#27bcfd',
  data: '#00d27a',
  crc: '#f5803e',
  error: '#e63757'
};

const TONE_CLASS = {
  success: 'text-success',
  danger: 'text-danger'
};

const WARNING_KEYS = {
  dataTooShort: 'The data segment is shorter than expected for this function code.',
  coilQuantityExceeds: 'The requested coil quantity exceeds the bits carried by the frame.',
  oddRegisterBytes: 'The register data contains an odd number of bytes.',
  invalidCoilValue: 'A write-single-coil value must be 0xFF00 (ON) or 0x0000 (OFF).',
  unknownFunction: 'Unsupported function code; showing the raw data segment.',
  tcpProtocolIdInvalid: 'Protocol identifier is not 0x0000, so this may not be a Modbus TCP frame.',
  tcpLengthMismatch: 'The length field ({{field}}) does not match the actual payload ({{actual}} bytes).'
};

const ERROR_KEYS = {
  empty: 'Please enter a hex frame.',
  odd: 'The hex string must contain an even number of digits.',
  tooLong: 'The frame exceeds 256 bytes.',
  rawOdd: 'Raw register data must contain an even number of bytes.',
  rtuTooShort: 'A Modbus RTU frame must be at least 4 bytes.',
  tcpTooShort: 'A Modbus TCP frame must be at least 8 bytes.'
};

const RENDER_LIMIT = 200;

const downloadCsv = (fileName, rows) => {
  const csv = rows.map(row => row.join(',')).join('\r\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const renderValue = (t, value, tone) => (
  <span className={tone ? TONE_CLASS[tone] : undefined}>{t(value)}</span>
);

const ParseResultPanel = ({ t, result, byteOrder, onByteOrderChange }) => {
  if (!result) {
    return <p className="text-muted fs--1 mb-0">{t('Enter a frame and click Parse Frame.')}</p>;
  }

  if (!result.ok) {
    return (
      <Alert color="danger" className="mb-0">
        {result.errors.map(error => (
          <div key={error.code}>{t(ERROR_KEYS[error.code] || 'Unable to parse the frame.')}</div>
        ))}
      </Alert>
    );
  }

  const renderMeta = () => (
    <div className="mb-3">
      <div className="text-800 fs--1 text-uppercase mb-2">{t('Frame Structure')}</div>
      <div className="form-row">
        {result.meta.map((item, index) => (
          <div className="col-6 col-md-4 mb-2" key={`${item.label}-${index}`}>
            <div className="text-muted" style={{ fontSize: '.75rem' }}>
              {t(item.label)}
            </div>
            <div className="font-weight-bold fs--1">{renderValue(t, item.value, item.tone)}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSegments = () => (
    <div className="mb-3">
      <div className="text-800 fs--1 text-uppercase mb-2">{t('Byte Breakdown')}</div>
      <div className="d-flex flex-wrap" style={{ rowGap: '4px' }}>
        {result.segments.map((segment, index) => (
          <span
            key={`${segment.label}-${index}`}
            className="d-inline-flex flex-column align-items-center mr-2 mb-2 px-2 py-1 border rounded bg-light"
            style={{ borderLeft: `3px solid ${SEGMENT_COLORS[segment.tone] || SEGMENT_COLORS.header}` }}
          >
            <span className="text-muted" style={{ fontSize: '10px', lineHeight: 1.2 }}>
              {t(segment.label)}
            </span>
            <code className="text-900" style={{ fontSize: '.75rem' }}>
              {segment.hex}
            </code>
          </span>
        ))}
      </div>
    </div>
  );

  const renderRegisters = () => {
    const registers = result.registers.slice(0, RENDER_LIMIT);
    if (registers.length === 0) return null;
    const handleExport = () => {
      const rows = [['Address', 'HEX', 'BIN', 'uint16', 'int16', 'uint32', 'int32', 'float32']];
      result.registers.forEach((register, index) => {
        const wide = index % 2 === 0 ? decodeWide(register, result.registers[index + 1], byteOrder) : null;
        rows.push([
          register.address,
          register.hex,
          register.bin,
          register.uint16,
          register.int16,
          wide ? wide.uint32 : '',
          wide ? wide.int32 : '',
          wide ? formatFloat(wide.float32) : ''
        ]);
      });
      downloadCsv('modbus-registers.csv', rows);
    };
    return (
      <div className="mb-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap mb-2" style={{ rowGap: '8px' }}>
          <div className="text-800 fs--1 text-uppercase">{t('Register Data')}</div>
          <div className="d-flex align-items-center">
            <span className="text-muted mr-2" style={{ fontSize: '.75rem' }}>
              {t('32-bit Byte Order')}
            </span>
            <Input
              type="select"
              size="sm"
              className="mr-2"
              style={{ width: 'auto' }}
              value={byteOrder}
              onChange={e => onByteOrderChange(e.target.value)}
            >
              {BYTE_ORDERS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Input>
            <Button color="soft-primary" size="sm" onClick={handleExport}>
              {t('Export CSV')}
            </Button>
          </div>
        </div>
        <Table size="sm" responsive bordered className="mb-1">
          <thead>
            <tr>
              <th>{t('Address')}</th>
              <th>HEX</th>
              <th>BIN</th>
              <th>uint16</th>
              <th>int16</th>
              <th>uint32</th>
              <th>int32</th>
              <th>float32</th>
            </tr>
          </thead>
          <tbody>
            {registers.map((register, index) => {
              const wide = index % 2 === 0 ? decodeWide(register, result.registers[index + 1], byteOrder) : null;
              return (
                <tr key={register.address}>
                  <td>
                    <div className="font-weight-bold">{register.address}</div>
                    <div className="text-muted" style={{ fontSize: '.75rem' }}>
                      0x{register.address.toString(16).padStart(4, '0').toUpperCase()}
                    </div>
                  </td>
                  <td>
                    <code>{register.hex}</code>
                  </td>
                  <td>
                    <code style={{ fontSize: '.75rem' }}>{register.bin}</code>
                  </td>
                  <td>{register.uint16}</td>
                  <td>{register.int16}</td>
                  <td>{wide ? wide.uint32 : '-'}</td>
                  <td>{wide ? wide.int32 : '-'}</td>
                  <td>{wide ? formatFloat(wide.float32) : '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        {result.registers.length > RENDER_LIMIT && (
          <div className="text-muted fs--1">
            {t('Only the first {{rows}} registers are rendered; the CSV export covers all rows.', {
              rows: RENDER_LIMIT
            })}
          </div>
        )}
        <div className="text-muted fs--2">
          {t('uint32, int32 and float32 combine the current register with the next one.')}
        </div>
      </div>
    );
  };

  const renderCoils = () => {
    const coils = result.coils.slice(0, RENDER_LIMIT);
    if (coils.length === 0) return null;
    return (
      <div className="mb-3">
        <div className="text-800 fs--1 text-uppercase mb-2">{t('Coil Data')}</div>
        <Table size="sm" responsive bordered className="mb-1">
          <thead>
            <tr>
              <th>{t('Address')}</th>
              <th>{t('State')}</th>
            </tr>
          </thead>
          <tbody>
            {coils.map(coil => (
              <tr key={coil.address}>
                <td>
                  {coil.address}{' '}
                  <span className="text-muted" style={{ fontSize: '.75rem' }}>
                    0x{coil.address.toString(16).padStart(4, '0').toUpperCase()}
                  </span>
                </td>
                <td>
                  <Badge color={coil.on ? 'success' : 'light'}>{coil.on ? 'ON' : 'OFF'}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {result.coils.length > RENDER_LIMIT && (
          <div className="text-muted fs--1">
            {t('Only the first {{rows}} coils are rendered.', { rows: RENDER_LIMIT })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="d-flex flex-wrap align-items-center mb-3" style={{ rowGap: '8px' }}>
        <Badge color="light" className="mr-2">
          {t(result.protocol === 'rtu' ? 'Modbus RTU' : result.protocol === 'tcp' ? 'Modbus TCP' : 'Raw Register Data')}
        </Badge>
        {result.direction && (
          <Badge color="light" className="mr-2">
            {t(result.direction === 'request' ? 'Request' : 'Response')}
          </Badge>
        )}
        <Badge color="light" className="mr-2">
          {t('{{count}} Bytes', { count: result.frameLength })}
        </Badge>
        {result.crc && (
          <Badge color={result.crc.match ? 'success' : 'danger'}>
            {result.crc.match ? t('CRC Passed') : t('CRC Failed')}
          </Badge>
        )}
      </div>

      {result.warnings.length > 0 && (
        <Alert color="warning" className="mb-3">
          {result.warnings.map((warning, index) => (
            <div key={`${warning.code}-${index}`}>{t(WARNING_KEYS[warning.code] || warning.code, warning.params)}</div>
          ))}
        </Alert>
      )}

      {renderMeta()}
      {renderSegments()}
      {renderRegisters()}
      {renderCoils()}
    </div>
  );
};

ParseResultPanel.propTypes = {
  t: PropTypes.func.isRequired,
  result: PropTypes.object,
  byteOrder: PropTypes.string.isRequired,
  onByteOrderChange: PropTypes.func.isRequired
};

export default ParseResultPanel;
