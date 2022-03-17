import React, { useContext } from 'react';
import PasswordResetForm from '../PasswordResetForm';
import AuthCardLayout from '../../../layouts/AuthCardLayout';
import { Link } from 'react-router-dom';
import AppContext from '../../../context/Context';

const PasswordReset = () => {
  const { isDark } = useContext(AppContext);

  return (
    <AuthCardLayout
      leftSideContent={
        <p className={`mb-0 mt-4 mt-md-5 fs--1 font-weight-semi-bold ${isDark ? 'text-800' : 'text-300'}`}>
          Read our{' '}
          <Link className={`text-underline ${isDark ? 'text-800' : 'text-300'}`} to="#!">
            terms
          </Link>{' '}
          and{' '}
          <Link className={`text-underline ${isDark ? 'text-800' : 'text-300'}`} to="#!">
            conditions{' '}
          </Link>
        </p>
      }
    >
      <h3>Reset password</h3>
      <PasswordResetForm layout="card" hasLabel />
    </AuthCardLayout>
  );
};

export default PasswordReset;
