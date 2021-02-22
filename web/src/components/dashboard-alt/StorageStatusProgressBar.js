import React from 'react';
import PropTypes from 'prop-types';
import { Progress } from 'reactstrap';
import classNames from 'classnames';

const StorageStatusProgressBar = ({ color, percentage, isLast }) => (
  <Progress
    bar
    color={color}
    value={percentage}
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
