import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Dot = ({ color, className, ...rest }) => (
  <span className={classNames('dot', { [`bg-${color}`]: !!color }, className)} {...rest} />
);

Dot.propTypes = {
  color: PropTypes.oneOf([
    'card-gradient',
    'primary',
    'secondary',
    'success',
    'info',
    'warning',
    'danger',
    'light',
    'dark',
    'black',
    '1100',
    '1000',
    '900',
    '800',
    '700',
    '600',
    '500',
    '400',
    '300',
    '200',
    '100',
    'white'
  ])
};

export default Dot;
