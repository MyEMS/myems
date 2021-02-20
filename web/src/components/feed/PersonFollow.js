import React from 'react';
import PropTypes from 'prop-types';
import { Media } from 'reactstrap';
import Avatar from '../common/Avatar';
import { Link } from 'react-router-dom';
import ButtonIcon from '../common/ButtonIcon';

const PersonFollow = ({ avatarSrc, name, mutual, divider }) => (
  <Media>
    <Avatar size="3xl" src={avatarSrc} />
    <Media body className="ml-2">
      <h6 className="mb-0">
        <Link to="/pages/profile">{name}</Link>
      </h6>
      {!!mutual && <p className="fs--1 mb-0">{mutual} mutual connections</p>}
      <ButtonIcon color="light" size="sm" icon="user-plus" className="py-0 mt-1 border" transform="shrink-5">
        <span className="fs--1">Follow</span>
      </ButtonIcon>

      {!divider && <hr className="border-bottom-0 border-dashed" />}
    </Media>
  </Media>
);

PersonFollow.propTypes = {
  avatarSrc: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  mutual: PropTypes.number,
  divider: PropTypes.bool
};

PersonFollow.defaultProps = { divider: false };

export default PersonFollow;
