import React from 'react';
import SentForgetPasswordEmailMessageForm from '../SentForgetPasswordEmailMessageForm';
import { withTranslation } from 'react-i18next';

const SentForgetPasswordEmailMessage = ({ t }) => {
  return (
    <div className="text-center">
      <h5 className="mb-0"> {t('Forgot your password?')}</h5>
      <small>{t("Enter your email and we'll send you a reset link.")}</small>
      <SentForgetPasswordEmailMessageForm />
    </div>
  );
};

export default withTranslation()(SentForgetPasswordEmailMessage);
