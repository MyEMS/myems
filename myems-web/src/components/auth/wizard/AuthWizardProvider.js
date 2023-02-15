import React, { useState } from 'react';
import { AuthWizardContext } from '../../../context/Context';

const AuthWizardProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [step, setStep] = useState(1);

  const handleInputChange = ({ value, name }) => setUser({ ...user, [name]: value });

  const value = { user, setUser, step, setStep, handleInputChange };
  return <AuthWizardContext.Provider value={value}>{children}</AuthWizardContext.Provider>;
};

export default AuthWizardProvider;
