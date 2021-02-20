import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Member = ({ avatarSrc, name, institution, institutionLink, profileLink }) => (
  <div className="bg-white p-3 h-100">
    <Link to={profileLink}>
      <img className="img-thumbnail img-fluid rounded-circle mb-3 shadow-sm" src={avatarSrc} width={100} alt="" />
    </Link>

    <h6 className="mb-1">
      <Link to={profileLink}>{name}</Link>
    </h6>
    <p className="fs--2 mb-1">
      <Link className="text-700" to={institutionLink}>
        {institution}
      </Link>
    </p>
  </div>
);

Member.propTypes = {
  avatarSrc: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  institution: PropTypes.string.isRequired,
  institutionLink: PropTypes.string.isRequired,
  profileLink: PropTypes.string.isRequired
};

export default Member;
