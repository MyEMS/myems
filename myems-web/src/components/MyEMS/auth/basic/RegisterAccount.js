import React, { useEffect, useState } from 'react';
import RegisterAccountForm from '../RegisterAccountForm';
import { withTranslation } from 'react-i18next';
import { Alert} from 'reactstrap';

const RegisterAccount = ({ t }) => {
  const [show, setShow] = useState(false);

  useEffect(()=>{
    const searchParams = new URLSearchParams(window.location.search);
    setShow(searchParams.get('expires'));
  }, [])

  return (
    <div className="text-center">
      <h5 className="mb-0"> {t('Create an account')}</h5>
      <small>{t("Welcome to MyEMS")}</small>
      <RegisterAccountForm />
    </div>
  );
};

export default withTranslation()(RegisterAccount);
