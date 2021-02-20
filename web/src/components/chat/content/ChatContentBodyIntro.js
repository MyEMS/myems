import React from 'react';
import PropTypes from 'prop-types';
import { Media } from 'reactstrap';
import { Link } from 'react-router-dom';
import Avatar from '../../common/Avatar';

const ChatContentBodyIntro = ({ user, isGroup }) => (
  <Media className="position-relative p-3 border-bottom mb-3 align-items-center">
    <Avatar className={`${user.status} mr-3`} size="2xl" src={user.avatarSrc} />
    <Media body>
      <h6 className="mb-0">
        <Link to="/pages/profile" className=" text-decoration-none stretched-link text-700">
          {user.name}
        </Link>
      </h6>
      <p className="mb-0">
        {isGroup
          ? `You are a member of ${user.name}. Say hi to start conversation to the group.`
          : `You friends with ${user.name}. Say hi to start the conversation`}
      </p>
    </Media>
  </Media>
);

ChatContentBodyIntro.propTypes = {
  isGroup: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired
};

export default ChatContentBodyIntro;
