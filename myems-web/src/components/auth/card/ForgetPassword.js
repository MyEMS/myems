import React from 'react';
import ForgetPasswordForm from '../ForgetPasswordForm';
import AuthCardLayout from '../../../layouts/AuthCardLayout';
import { Link } from 'react-router-dom';

const ForgetPassword = () => {
  return (
    <AuthCardLayout
      leftSideContent={
        <p className="mb-0 mt-4 mt-md-5 fs--1 font-weight-semi-bold text-300">
          Read our{' '}
          <Link className="text-underline text-300" to="#!">
            terms
          </Link>{' '}
          and{' '}
          <Link className="text-underline text-300" to="#!">
            conditions{' '}
          </Link>
        </p>
      }
    >
      <h4 className="mb-0"> Forgot your password?</h4>
      <p className="mb-0">Enter your email and we'll send you a reset link.</p>
      <ForgetPasswordForm layout="card" />
    </AuthCardLayout>
  );
};

export default ForgetPassword;
