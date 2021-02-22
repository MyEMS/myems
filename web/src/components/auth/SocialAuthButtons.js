import React from 'react';
import { FormGroup, Button, Col, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SocialAuthButtons = () => (
  <FormGroup className="mb-0">
    <Row noGutters>
      <Col sm={6} className="pr-sm-1">
        <Button color="outline-google-plus" size="sm" block className="mt-2" to="#!">
          <FontAwesomeIcon icon={['fab', 'google-plus-g']} transform="grow-8" className="mr-2" /> google
        </Button>
      </Col>
      <Col sm={6} className="pl-sm-1">
        <Button color="outline-facebook" size="sm" block className="mt-2" to="#!">
          <FontAwesomeIcon icon={['fab', 'facebook-square']} transform="grow-8" className="mr-2" /> facebook
        </Button>
      </Col>
    </Row>
  </FormGroup>
);

export default SocialAuthButtons;
