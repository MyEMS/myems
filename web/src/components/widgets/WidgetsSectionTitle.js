import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Media } from 'reactstrap';

const WidgetsSectionTitle = ({ title, subtitle, className, icon, transform }) => (
  <Media className={className}>
    <span className="fa-stack ml-n1 mr-2">
      <FontAwesomeIcon icon="circle" className="text-300 fa-stack-2x" />
      <FontAwesomeIcon icon={icon} transform={transform} className="text-primary fa-stack-1x" inverse />
    </span>
    <Media body>
      <Media heading tag="h5" className="text-primary position-relative mb-0">
        <span className="bg-200 pr-3">{title}</span>
        <span className="border position-absolute absolute-vertical-center w-100 z-index--1 l-0" />
      </Media>
      <p className="mb-0">{subtitle}</p>
    </Media>
  </Media>
);

WidgetsSectionTitle.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  className: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  transform: PropTypes.string
};

WidgetsSectionTitle.defaultProps = {
  title: 'Your Title',
  subtitle: 'Here is your subtitle',
  className: 'mt-6 mb-4',
  icon: 'icons'
};

export default WidgetsSectionTitle;
