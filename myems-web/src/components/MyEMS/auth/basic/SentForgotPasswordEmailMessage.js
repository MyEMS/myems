import React, { useEffect, useState } from 'react';
import SentForgotPasswordEmailMessageForm from '../SentForgotPasswordEmailMessageForm';
import { withTranslation } from 'react-i18next';
import { Alert } from 'reactstrap';

const SentForgotPasswordEmailMessage = ({ t }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setShow(searchParams.get('expires'));
  }, []);

  return (
    <div className="text-center">
      {show ? (
        <Alert color={'danger'} key="danger">
          <p className="mb-0">{t('It looks like you clicked on an invalid password reset link. Please tryagain.')}</p>
        </Alert>
      ) : (
        <></>
      )}
      <h5 className="mb-0"> {t('Password reset')}</h5>
      <SentForgotPasswordEmailMessageForm />
    </div>
  );
};

export default withTranslation()(SentForgotPasswordEmailMessage);
