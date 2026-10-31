import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Input, InputGroup, InputGroupText } from 'reactstrap';

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
    <div className="d-flex align-items-center flex-wrap mb-2">
      <InputGroup size="sm" className="mr-3" style={{ maxWidth: '180px' }}>
        <InputGroupText>{t('Indent')}</InputGroupText>
        <Input type="select" value={indent} onChange={e => onIndentChange(e.target.value)}>
          <option value="2">{t('2 Spaces')}</option>
          <option value="4">{t('4 Spaces')}</option>
          <option value="tab">{t('Tab')}</option>
        </Input>
      </InputGroup>
      {/* One compact toolbar: primary action left, secondary groups following,
          sample/clear pushed to the right edge; wraps on narrow screens. */}
      <Button color="primary" size="sm" onClick={onValidate} className="mr-2">
        {t('Validate')}
      </Button>
      <ButtonGroup size="sm" className="mr-2">
        <Button color="soft-primary" onClick={onFormat}>
          {t('Format')}
        </Button>
        <Button color="soft-primary" onClick={onMinify}>
          {t('Minify')}
        </Button>
      </ButtonGroup>
      <ButtonGroup size="sm" className="ml-auto">
        <Button color="soft-secondary" onClick={onLoadSample}>
          {t('Load Sample')}
        </Button>
        <Button color="soft-secondary" onClick={onClear}>
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
