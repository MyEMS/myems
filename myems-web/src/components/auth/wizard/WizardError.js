import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const WizardError = ({ error, className, ...rest }) =>
  !!error ? (
    <span className={classNames('text-danger d-inline-block', className)} {...rest}>
      {error}
    </span>
  ) : null;

WizardError.defaultProps = { error: '' };

WizardError.propTypes = { error: PropTypes.string.isRequired };

export default WizardError;
