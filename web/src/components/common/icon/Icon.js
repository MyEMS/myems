import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';

const Icon = ({ icon, bg, color, className, transform, ...rest }) => (
  <a
    className={classNames(
      'icon-item',
      {
        [`bg-${bg}`]: bg,
        [`text-${color}`]: color
      },
      className
    )}
    {...rest}
  >
    <FontAwesomeIcon icon={icon} transform={transform} />
  </a>
);

Icon.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  href: PropTypes.string.isRequired,
  bg: PropTypes.string,
  color: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  transform: PropTypes.string
};

export default Icon;
