import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { CustomInput, Input, Label } from 'reactstrap';
import uuid from 'uuid/v1';

const FalconInput = ({ label, labelClassName, custom, onChange, type, ...rest }) => {
  const Tag = custom ? CustomInput : Input;
  const inputId = uuid();

  if (type === 'file' && custom) {
    return <Tag type={type} label={label} onChange={({ target }) => onChange(target.files)} {...rest} id={inputId} />;
  }

  return (
    <Fragment>
      {!!label && (
        <Label for={inputId} className={labelClassName}>
          {label}
        </Label>
      )}
      <Tag type={type} onChange={({ target }) => onChange(target.value)} {...rest} id={inputId} />
    </Fragment>
  );
};

FalconInput.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  labelClassName: PropTypes.string,
  custom: PropTypes.bool
};

FalconInput.defaultProps = {
  custom: false,
  type: 'text'
};

export default FalconInput;
