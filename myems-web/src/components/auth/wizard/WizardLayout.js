import React from 'react';
import { Col, Row } from 'reactstrap';
import UserForm from './UserForm';
import Section from '../../../components/common/Section';
import Logo from '../../../components/navbar/Logo';
import AuthWizardProvider from './AuthWizardProvider';

const WizardLayout = () => {
  return (
    <Section className="py-0">
      <Row className="flex-center min-vh-100 py-6">
        <Col sm={10} lg={7} className="col-xxl-5">
          <Logo />
          <AuthWizardProvider>
            <UserForm />
          </AuthWizardProvider>
        </Col>
      </Row>
    </Section>
  );
};

export default WizardLayout;
