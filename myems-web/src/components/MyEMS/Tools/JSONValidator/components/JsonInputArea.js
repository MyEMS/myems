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
      className="mb-3 font-monospace"
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
    </div>
    <ButtonGroup className="w-100 mb-1">
      <Button color="primary" size="sm" onClick={onValidate}>
        {t('Validate')}
      </Button>
      <Button color="soft-primary" size="sm" onClick={onFormat}>
        {t('Format')}
      </Button>
      <Button color="soft-primary" size="sm" onClick={onMinify}>
        {t('Minify')}
      </Button>
    </ButtonGroup>
    <ButtonGroup className="w-100">
      <Button color="soft-secondary" size="sm" onClick={onLoadSample}>
        {t('Load Sample')}
      </Button>
      <Button color="soft-secondary" size="sm" onClick={onClear}>
        {t('Clear')}
      </Button>
    </ButtonGroup>
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
