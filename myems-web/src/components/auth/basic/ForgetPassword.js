import React from 'react';
import ForgetPasswordForm from '../ForgetPasswordForm';

const ForgetPassword = () => {
  return (
    <div className="text-center">
      <h5 className="mb-0"> Forgot your password?</h5>
      <small>Enter your email and we'll send you a reset link.</small>
      <ForgetPasswordForm />
    </div>
  );
};

export default ForgetPassword;
