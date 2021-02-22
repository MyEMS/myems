import React from 'react';
import ForgetPasswordForm from '../ForgetPasswordForm';
import { withTranslation } from 'react-i18next';

const ForgetPassword = ({ t }) => {
  return (
    <div className="text-center">
      <h5 className="mb-0"> {t('Forgot your password?')}</h5>
      <small>{t("Enter your email and we'll send you a reset link.")}</small>
      <ForgetPasswordForm />
    </div>
  );
};

export default withTranslation()(ForgetPassword);
