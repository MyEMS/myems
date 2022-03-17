import React from 'react';
import PropTypes from 'prop-types';
import { CustomInput, FormGroup, Label } from 'reactstrap';
import Loader from './Loader';
import { isIterableArray } from '../../helpers/utils';
import createMarkup from '../../helpers/createMarkup';

const FormGroupSelect = ({ loading, id, label, options, value, onChange, ...rest }) => {
  return (
    <FormGroup>
      <Label for={id}>{label}</Label>
      {loading ? (
        <Loader />
      ) : (
        <CustomInput type="select" id={id} value={value} onChange={onChange} {...rest}>
          {isIterableArray(options) &&
            options.map(({ value, label }, index) => (
              <option value={value} key={index} dangerouslySetInnerHTML={createMarkup(label)} />
            ))}
        </CustomInput>
      )}
    </FormGroup>
  );
};

FormGroupSelect.propTypes = {
  loading: PropTypes.bool.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired
};

export default FormGroupSelect;
