import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import FalconProgress from '../common/FalconProgressBar';

const StorageStatusProgressBar = ({ color, percentage, isLast }) => (
  <FalconProgress
    bar
    value={percentage}
    color={color}
    className={classNames({ 'border-right border-white border-2x': !isLast })}
  />
);

StorageStatusProgressBar.propTyeps = {
  color: PropTypes.string.isRequired,
  percentage: PropTypes.number.isRequired,
  isLast: PropTypes.bool
};

StorageStatusProgressBar.defaultProps = { isLast: false };

export default StorageStatusProgressBar;
