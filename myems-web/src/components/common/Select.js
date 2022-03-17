import React from 'react';
import PropTypes from 'prop-types';
import ReactSelect from 'react-select';
import CreatableSelect from 'react-select/creatable';

const Select = ({ isCreatable, ...rest }) => {
  if (isCreatable) {
    return <CreatableSelect {...rest} />;
  }
  return <ReactSelect {...rest} />;
};

Select.propTypes = {
  classNamePrefix: PropTypes.string,
  isCreatable: PropTypes.bool
};

Select.defaultProps = {
  classNamePrefix: 'react-select',
  isCreatable: false
};

export default Select;
