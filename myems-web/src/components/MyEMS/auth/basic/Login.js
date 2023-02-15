import React, { Fragment } from 'react';
import { Col, Row } from 'reactstrap';
import LoginForm from '../LoginForm';
import { withTranslation } from 'react-i18next';

const Login = ({ t }) => (
  <Fragment>
    <Row className="text-left justify-content-between">
      <Col xs="auto">
        <h5>{t('Log in')}</h5>
      </Col>
     </Row>
    <LoginForm />
  </Fragment>
);

export default  withTranslation()(Login);
