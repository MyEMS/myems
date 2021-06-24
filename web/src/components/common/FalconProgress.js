import React from 'react';
import PropTypes from 'prop-types';
import FalconProgressBar from './FalconProgressBar';

const FalconProgress = ({ value, className, style, color, barStyle, barClassName, multi, children, bar }) => {
  return (
    <>
      {bar === true ? (
        <FalconProgressBar />
      ) : (
        <div className={`progress ${className ?? ''} bg-${color}`} style={style}>
          {multi ? (
            children
          ) : (
            <FalconProgressBar value={value} className={barClassName} color={color} style={barStyle} />
          )}
        </div>
      )}
    </>
  );
};

FalconProgress.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  color: PropTypes.string,
  barStyle: PropTypes.object,
  className: PropTypes.string,
  barClassName: PropTypes.string,
  style: PropTypes.object,
  multi: PropTypes.bool
};

FalconProgress.defaultProps = {
  value: 0
};

export default FalconProgress;
