import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Row, Col } from 'reactstrap';

const Process = ({ icon, iconText, color, title, description, image, inverse, children }) => {
  return (
    <Row className="flex-center mt-8">
      <Col md lg={5} xl={4} className={classNames('pl-lg-6', { 'order-md-2': inverse })}>
        <img className="img-fluid px-6 px-md-0" src={image} alt="" />
      </Col>
      <Col md lg={5} xl={4} className="mt-4 mt-md-0">
        <h5 className={`text-${color}`}>
          <FontAwesomeIcon icon={icon} className="mr-2" />
          {iconText}
        </h5>
        <h3>{title}</h3>
        <p>{description}</p>
        {children}
      </Col>
    </Row>
  );
};

Process.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
  iconText: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
  inverse: PropTypes.bool,
  children: PropTypes.node
};

Process.defaultProps = { inverse: false };

export default Process;
