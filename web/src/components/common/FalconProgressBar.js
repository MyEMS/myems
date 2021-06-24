import React from 'react';

const FalconProgressBar = ({ className, barStyle, value, color }) => (
  <div
    className={`progress-bar ${className ?? ''} bg-${color}`}
    style={{ ...barStyle, width: `${value}%` }}
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin="0"
    aria-valuemax="100"
  />
);

export default FalconProgressBar;
