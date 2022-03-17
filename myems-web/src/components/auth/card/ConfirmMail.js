import React from 'react';
import ConfirmMailContent from '../ConfirmMailContent';
import AuthCardLayout from '../../../layouts/AuthCardLayout';
import { Link } from 'react-router-dom';

const ConfirmMail = () => (
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
    <div className="text-center">
      <ConfirmMailContent layout="card" email="xyz@abc.com" titleTag="h3" />
    </div>
  </AuthCardLayout>
);

export default ConfirmMail;
