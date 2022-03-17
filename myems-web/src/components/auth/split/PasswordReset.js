import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import PasswordResetForm from '../PasswordResetForm';
import withAuthSplit from '../../../hoc/withAuthSplit';

import bgImg from '../../../assets/img/generic/20.jpg';

const PasswordReset = ({ setBgProps }) => {
  useEffect(() => setBgProps({ image: bgImg }), [setBgProps]);

  return (
    <div className="text-center">
      <h3>Reset password</h3>
      <PasswordResetForm layout="split" hasLabel />
    </div>
  );
};

PasswordReset.propTypes = { setBgProps: PropTypes.func.isRequired };

export default withAuthSplit(PasswordReset);
