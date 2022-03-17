import React from 'react';
import PropTypes from 'prop-types';
import Media from 'reactstrap/es/Media';
import Avatar from '../common/Avatar';
import { Link } from 'react-router-dom';

const ActiveUser = ({ name, avatar, role }) => (
  <Media className="align-items-center mb-3">
    <Avatar {...avatar} className={`status-${avatar.status}`} />
    <Media body className="ml-3">
      <h6 className="mb-0 font-weight-semi-bold">
        <Link className="text-900" to="/pages/profile">
          {name}
        </Link>
      </h6>
      <p className="text-500 fs--2 mb-0">{role}</p>
    </Media>
  </Media>
);

ActiveUser.propTypes = {
  name: PropTypes.string.isRequired,
  avatar: PropTypes.shape(Avatar.propTypes).isRequired,
  role: PropTypes.string.isRequired
};

export default ActiveUser;
