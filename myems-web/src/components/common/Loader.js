import React from 'react';
import { Col, Row, Spinner } from 'reactstrap';

const Loader = props => (
  <Row className="flex-center py-5">
    <Col xs="auto">
      <Spinner {...props} />
    </Col>
  </Row>
);

Loader.propTypes = { ...Spinner.propTypes };

Loader.defaultProps = {
  type: 'grow',
  size: 'lg',
  color: 'primary'
};

export default Loader;
