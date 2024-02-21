import React from 'react';
import ChangePasswordForm from '../ChangePasswordForm';
import { withTranslation } from 'react-i18next';

const ChangePassword = ({ t }) => {
  return <ChangePasswordForm />;
};

export default withTranslation()(ChangePassword);
