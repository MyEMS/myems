import React from 'react';
import SentForgotPasswordEmailMessageForm from '../SentForgotPasswordEmailMessageForm';
import { withTranslation } from 'react-i18next';

const SentForgotPasswordEmailMessage = ({ t }) => {
  return (
    <div className="text-center">
      <h5 className="mb-0"> {t('Forgot your password?')}</h5>
      <small>{t("Enter your email and we'll send you a reset link.")}</small>
      <SentForgotPasswordEmailMessageForm />
    </div>
  );
};

export default withTranslation()(SentForgotPasswordEmailMessage);
