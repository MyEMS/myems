import React from 'react';
import PropTypes from 'prop-types';
import { FormFeedback, Input, Label } from 'reactstrap';
import { listStandards } from '../cableStandards';

const StandardSelector = ({ value, onChange, t }) => {
  const standards = listStandards();
  return (
    <div className="form-group">
      <Label for="cable-standard">{t('Calculation Standard')}</Label>
      <Input type="select" id="cable-standard" value={value} onChange={e => onChange(e.target.value)}>
        {standards.map(std => (
          <option key={std.id} value={std.id}>
            {std.getName(t)}
          </option>
        ))}
      </Input>
      <FormFeedback>{t('Unsupported standard')}</FormFeedback>
    </div>
  );
}

StandardSelector.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired
};

export default StandardSelector;
