import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const Divider = ({ className, children }) => (
  <div className={classNames('w-100 position-relative text-center', className)}>
    <hr className="text-300" />
    <div className="position-absolute absolute-centered t-0 px-3 bg-white text-sans-serif fs--1 text-500 text-nowrap">
      {children}
    </div>
  </div>
);

Divider.propTypes = {
  className: PropTypes.node,
  children: PropTypes.node
};

export default Divider;
