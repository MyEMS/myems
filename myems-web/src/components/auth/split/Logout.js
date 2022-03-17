import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import LogoutContent from '../LogoutContent';
import withAuthSplit from '../../../hoc/withAuthSplit';

import bgImg from '../../../assets/img/generic/19.jpg';

const Logout = ({ setBgProps }) => {
  useEffect(() => setBgProps({ image: bgImg }), [setBgProps]);

  return (
    <div className="text-center">
      <LogoutContent layout="split" titleTag="h3" />
    </div>
  );
};

Logout.propTypes = { setBgProps: PropTypes.func.isRequired };

export default withAuthSplit(Logout);
