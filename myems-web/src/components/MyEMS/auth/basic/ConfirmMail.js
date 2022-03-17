import React, { useState } from 'react';
import ConfirmMailContent from '../ConfirmMailContent';
import { getItemFromStore, setItemToStore } from '../../../../helpers/utils';
import { withTranslation } from 'react-i18next';

const ConfirmMail = ({ t }) => {
  // State
  const [email, setEmail] = useState(getItemFromStore('email', ''));
  return (
    <div className="text-center">
      <ConfirmMailContent email={email} />
    </div>
  );
};

export default withTranslation()(ConfirmMail);
