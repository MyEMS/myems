import React, { useEffect, useState } from 'react';
import SentRegisterEmailMessageForm from '../SentRegisterEmailMessageForm';
import { withTranslation } from 'react-i18next';
import { Alert } from 'reactstrap';

const SentRegisterEmailMessage = ({ t }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setShow(searchParams.get('expires'));
  }, []);

  return (
    <div className="text-center">
      {show ? (
        <Alert color={'danger'} key="danger">
          <p className="mb-0">
            {t('It looks like you clicked on an invalid registration account link. Please tryagain.')}
          </p>
        </Alert>
      ) : (
        <></>
      )}
      <h5 className="mb-0"> {t('Create an account')}</h5>
      <SentRegisterEmailMessageForm />
    </div>
  );
};

export default withTranslation()(SentRegisterEmailMessage);
