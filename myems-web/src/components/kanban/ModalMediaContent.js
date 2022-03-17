import React from 'react';

import { Media } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
const ModalMediaContent = ({ children, icon, transform, title, headingClass, headingContent, isHr }) => {
  return (
    <Media>
      <span className="fa-stack ml-n1 mr-3">
        <FontAwesomeIcon icon="circle" className="text-200 fa-stack-2x" />
        <FontAwesomeIcon icon={icon} transform={`shrink-2 ${transform}`} className="text-primary fa-stack-1x" inverse />
      </span>
      <Media body>
        <Media heading tag="div" className={`mb-2 ${headingClass}`}>
          <h5 className="fs-0">{title}</h5>
          {headingContent}
        </Media>
        {children}
        {isHr && <hr className="my-4" />}
      </Media>
    </Media>
  );
};

ModalMediaContent.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  children: PropTypes.node.isRequired,
  headingContent: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  transform: PropTypes.string,
  isHr: PropTypes.bool
};

ModalMediaContent.defaultProps = {
  isHr: true
};

export default ModalMediaContent;
