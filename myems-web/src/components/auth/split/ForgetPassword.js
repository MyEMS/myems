import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ForgetPasswordForm from '../ForgetPasswordForm';
import withAuthSplit from '../../../hoc/withAuthSplit';

import bgImg from '../../../assets/img/generic/17.jpg';

const ForgetPassword = ({ setBgProps }) => {
  useEffect(() => setBgProps({ image: bgImg, position: '50% 76%', overlay: true }), [setBgProps]);

  return (
    <div className="text-center">
      <h4 className="mb-0"> Forgot your password?</h4>
      <small>Enter your email and we'll send you a reset link.</small>
      <ForgetPasswordForm layout="split" />
    </div>
  );
};

ForgetPassword.propTypes = { setBgProps: PropTypes.func.isRequired };

export default withAuthSplit(ForgetPassword);
