import React from 'react';
import ForgotPasswordForm from '../ForgotPasswordForm';
import { withTranslation } from 'react-i18next';

const ForgetPassword = ({ t }) => {
  return (
    <ForgotPasswordForm />
  );
};

export default withTranslation()(ForgetPassword);
