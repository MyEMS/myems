import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Input } from 'reactstrap';
import { PROTOCOL_OPTIONS, DIRECTION_OPTIONS } from '../modbusUtils';

const buttonStyle = {
  height: '34px',
  fontSize: '.875rem',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const labelStyle = { fontSize: '.75rem' };

// Frame input panel: protocol / direction selects, start address and optional
// coil count, the hex frame textarea and the action toolbar.
const FrameInputPanel = ({
  t,
  protocol,
  onProtocolChange,
  direction,
  onDirectionChange,
  startAddress,
  onStartAddressChange,
  coilQuantity,
  onCoilQuantityChange,
  hexText,
  onHexChange,
  onParse,
  onLoadSample,
  onClear
}) => (
  <div>
    <div className="text-800 fs--1 text-uppercase mb-2">{t('Input Frame')}</div>
    <div className="form-row">
      <div className="col-6 mb-2">
        <label className="text-muted mb-1" style={labelStyle} htmlFor="modbus-protocol">
          {t('Protocol Type')}
        </label>
        <Input
          type="select"
          size="sm"
          id="modbus-protocol"
          value={protocol}
          onChange={e => onProtocolChange(e.target.value)}
        >
          {PROTOCOL_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </Input>
      </div>
      <div className="col-6 mb-2">
        <label className="text-muted mb-1" style={labelStyle} htmlFor="modbus-direction">
          {t('Data Direction')}
        </label>
        <Input
          type="select"
          size="sm"
          id="modbus-direction"
          value={direction}
          disabled={protocol === 'raw'}
          onChange={e => onDirectionChange(e.target.value)}
        >
          {DIRECTION_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {t(option.label)}
            </option>
          ))}
        </Input>
      </div>
    </div>
    <div className="form-row">
      <div className="col-6 mb-2">
        <label className="text-muted mb-1" style={labelStyle} htmlFor="modbus-start-address">
          {t('Starting Address (Decimal)')}
        </label>
        <Input
          type="number"
          size="sm"
          id="modbus-start-address"
          min="0"
          value={startAddress}
          onChange={e => onStartAddressChange(e.target.value)}
        />
      </div>
      <div className="col-6 mb-2">
        <label className="text-muted mb-1" style={labelStyle} htmlFor="modbus-coil-quantity">
          {t('Coil Quantity (Optional)')}
        </label>
        <Input
          type="number"
          size="sm"
          id="modbus-coil-quantity"
          min="1"
          placeholder={t('FC01 / FC02 Response')}
          value={coilQuantity}
          disabled={protocol === 'raw'}
          onChange={e => onCoilQuantityChange(e.target.value)}
        />
      </div>
    </div>
    <label className="text-muted mb-1" style={labelStyle} htmlFor="modbus-frame">
      {t('Hex Frame')}
    </label>
    <Input
      type="textarea"
      id="modbus-frame"
      name="modbus-frame"
      rows={8}
      spellCheck={false}
      className="mb-2 font-monospace"
      style={{ fontFamily: 'SFMono-Regular, Menlo, Consolas, monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
      value={hexText}
      onChange={e => onHexChange(e.target.value)}
      placeholder="01 03 00 00 00 0A C5 CD"
    />
    <div className="d-flex align-items-center flex-wrap" style={{ rowGap: '8px' }}>
      <Button color="primary" size="sm" onClick={onParse} className="mr-2" style={buttonStyle}>
        {t('Parse Frame')}
      </Button>
      <ButtonGroup size="sm" className="ml-auto">
        <Button color="soft-secondary" onClick={onLoadSample} style={buttonStyle}>
          {t('Load Sample')}
        </Button>
        <Button color="soft-secondary" onClick={onClear} style={buttonStyle}>
          {t('Clear')}
        </Button>
      </ButtonGroup>
    </div>
    <div className="text-muted fs--2 mt-2">
      {t('Accepts spaces, commas, 0x prefixes or continuous hex digits.')}
    </div>
  </div>
);

FrameInputPanel.propTypes = {
  t: PropTypes.func.isRequired,
  protocol: PropTypes.string.isRequired,
  onProtocolChange: PropTypes.func.isRequired,
  direction: PropTypes.string.isRequired,
  onDirectionChange: PropTypes.func.isRequired,
  startAddress: PropTypes.string.isRequired,
  onStartAddressChange: PropTypes.func.isRequired,
  coilQuantity: PropTypes.string.isRequired,
  onCoilQuantityChange: PropTypes.func.isRequired,
  hexText: PropTypes.string.isRequired,
  onHexChange: PropTypes.func.isRequired,
  onParse: PropTypes.func.isRequired,
  onLoadSample: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired
};

export default FrameInputPanel;
