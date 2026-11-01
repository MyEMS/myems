import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Input, InputGroup, InputGroupText } from 'reactstrap';

// Bootstrap hardcodes .form-control-sm (padding .25rem, height ~31px) while
// .btn-sm follows the theme's $input-btn-padding-y-sm (0.1875rem, height
// ~29px), so a small select and small buttons never share a height.
// Force one uniform height and center each control's content vertically.
const TOOLBAR_HEIGHT = '34px';
const controlStyle = { height: TOOLBAR_HEIGHT, fontSize: '.875rem', lineHeight: '1.25' };
const buttonStyle = { ...controlStyle, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
const fillStyle = { height: '100%', fontSize: '.875rem' };
// .input-group wraps its children by default; with a fixed height a long
// translated label would fold and get clipped, so keep one row and let the
// select absorb the remaining width instead.
const inputGroupStyle = { ...controlStyle, flexWrap: 'nowrap', maxWidth: '220px' };
const labelTextStyle = { ...fillStyle, whiteSpace: 'nowrap' };
const selectStyle = { ...fillStyle, minWidth: 0 };

// Input textarea plus the action toolbar (validate / format / minify / clear / sample).
const JsonInputArea = ({ t, value, onChange, indent, onIndentChange, onValidate, onFormat, onMinify, onClear, onLoadSample }) => (
  <div>
    <div className="text-800 fs--1 text-uppercase mb-2">{t('Input JSON Data')}</div>
    <Input
      type="textarea"
      name="json-input"
      id="json-input"
      rows={18}
      spellCheck={false}
      className="mb-2 font-monospace"
      style={{ fontFamily: 'SFMono-Regular, Menlo, Consolas, monospace', whiteSpace: 'pre' }}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={`{ "name": "MyEMS", "value": 123 }`}
    />
    <div className="d-flex align-items-center flex-wrap mb-2" style={{ rowGap: '8px' }}>
      <InputGroup size="sm" className="mr-3" style={inputGroupStyle}>
        <InputGroupText style={labelTextStyle}>{t('Indent')}</InputGroupText>
        <Input type="select" style={selectStyle} value={indent} onChange={e => onIndentChange(e.target.value)}>
          <option value="2">{t('2 Spaces')}</option>
          <option value="4">{t('4 Spaces')}</option>
          <option value="tab">{t('Tab')}</option>
        </Input>
      </InputGroup>
      {/* One compact toolbar: primary action left, secondary groups following,
          sample/clear pushed to the right edge; wraps on narrow screens. */}
      <Button color="primary" size="sm" onClick={onValidate} className="mr-2" style={buttonStyle}>
        {t('Validate')}
      </Button>
      <ButtonGroup size="sm" className="mr-2">
        <Button color="soft-primary" onClick={onFormat} style={buttonStyle}>
          {t('Format')}
        </Button>
        <Button color="soft-primary" onClick={onMinify} style={buttonStyle}>
          {t('Minify')}
        </Button>
      </ButtonGroup>
      <ButtonGroup size="sm" className="ml-auto">
        <Button color="soft-secondary" onClick={onLoadSample} style={buttonStyle}>
          {t('Load Sample')}
        </Button>
        <Button color="soft-secondary" onClick={onClear} style={buttonStyle}>
          {t('Clear')}
        </Button>
      </ButtonGroup>
    </div>
  </div>
);

JsonInputArea.propTypes = {
  t: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  indent: PropTypes.string.isRequired,
  onIndentChange: PropTypes.func.isRequired,
  onValidate: PropTypes.func.isRequired,
  onFormat: PropTypes.func.isRequired,
  onMinify: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  onLoadSample: PropTypes.func.isRequired
};

export default JsonInputArea;
