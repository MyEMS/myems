import React from 'react';
import WidgetsSectionTitle from './WidgetsSectionTitle';
import Registration from '../auth/basic/Registration';
import { Row, Col, Button } from 'reactstrap';
import AdvanceUserForm from '../auth/wizard/AdvanceUserForm';
import AuthWizardProvider from '../auth/wizard/AuthWizardProvider';
import { useForm } from 'react-hook-form';
import ForgetPassword from '../auth/basic/ForgetPassword';
import AuthBasicLayoutWidgets from './AuthBasicLayoutWidgets';
import Experience from '../experience/Experience';
import PasswordReset from '../auth/basic/PasswordReset';
import LoginForm from '../auth/LoginForm';
import AuthSplitLayoutWidgets from './AuthSplitLayoutWidgets';
import PostCreateForm from '../feed/PostCreateForm';
import FeedProvider from '../feed/FeedProvider';
import Compose from '../email/Compose';
import DropZoneWidget from './DropZoneWidget';

const Forms = () => {
  const { register, errors } = useForm();

  return (
    <>
      <WidgetsSectionTitle
        icon="file-alt"
        title="Forms"
        subtitle="Get different types of data from the user by using #{theme}'s customizable form."
        transform="shrink-2"
      />
      <Row>
        <Col lg={5} className="pr-lg-2 mb-3 mb-lg-0">
          <Row noGutters className="h-100 align-items-stretch">
            <Col xs={12} className="mb-3">
              <AuthBasicLayoutWidgets className="h-lg-100">
                <Registration />
              </AuthBasicLayoutWidgets>
            </Col>
            <Col xs={12} className="mb-3">
              <AuthBasicLayoutWidgets className="h-lg-100">
                <ForgetPassword />
              </AuthBasicLayoutWidgets>
            </Col>
            <Col xs={12} className="mb-3">
              <AuthBasicLayoutWidgets className="h-lg-100">
                <PasswordReset />
              </AuthBasicLayoutWidgets>
            </Col>
            <Col xs={12} className="mb-lg-3">
              <AuthSplitLayoutWidgets className="h-lg-100">
                <LoginForm layout="split" hasLabel />
              </AuthSplitLayoutWidgets>
            </Col>
          </Row>
        </Col>
        <Col lg={7} className="pl-lg-2">
          <AuthBasicLayoutWidgets className="mb-3">
            <AuthWizardProvider>
              <AdvanceUserForm register={register} errors={errors} />
              <Button color="primary" className="ml-auto d-block">
                Save
              </Button>
            </AuthWizardProvider>
          </AuthBasicLayoutWidgets>
          <Experience isEditable isOpen={true} className="mb-3" />
          <FeedProvider>
            <PostCreateForm />
          </FeedProvider>
        </Col>
      </Row>
      <Compose recipientOption={{ closeMenuOnSelect: false, autoFocus: false, isMulti: true, isCreatable: true }} />
      <DropZoneWidget />
    </>
  );
};

export default Forms;
