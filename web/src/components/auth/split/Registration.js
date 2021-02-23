import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Flex from '../../common/Flex';
import RegistrationForm from '../RegistrationForm';
import withAuthSplit from '../../../hoc/withAuthSplit';

import bgImg from '../../../assets/img/generic/15.jpg';

const Registration = ({ setBgProps }) => {
  useEffect(() => setBgProps({ image: bgImg }), [setBgProps]);

  return (
    <Fragment>
      <Flex align="center" justify="between">
        <h3>Register</h3>
        <p className="mb-0 fs--1">
          <span className="font-weight-semi-bold">Already User? </span>
          <Link to="/authentication/split/login">Login</Link>
        </p>
      </Flex>
      <RegistrationForm layout="split" hasLabel />
    </Fragment>
  );
};

Registration.propTypes = { setBgProps: PropTypes.func.isRequired };

export default withAuthSplit(Registration);
