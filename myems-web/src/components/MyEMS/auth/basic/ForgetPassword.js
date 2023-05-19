import React from 'react';
import ForgetPasswordForm from '../ForgetPasswordForm';
import { withTranslation } from 'react-i18next';

const ForgetPassword = ({ t }) => {
  return (
    <ForgetPasswordForm />
  );
};

export default withTranslation()(ForgetPassword);
