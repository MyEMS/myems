import React from 'react';
import { Media } from 'reactstrap';
import Avatar from '../common/Avatar';
import users from '../../data/dashboard/users';
import { Link } from 'react-router-dom';
const ModalActivityContent = () => {
  return (
    <>
      <Media className="mb-3">
        <Link to="pages/profile">
          <Avatar src={users[3].avatar.src} size="l" />
        </Link>
        <Media body className="ml-2 fs--1">
          <p className="mb-0">
            <Link to="pages/profile" className="font-weight-semi-bold">
              Rowan
            </Link>{' '}
            Added the card
          </p>
          <div className="fs--2"> 6 hours ago</div>
        </Media>
      </Media>
      <Media>
        <Link to="pages/profile">
          <Avatar src={users[2].avatar.src} size="l" />
        </Link>
        <Media body className="ml-2 fs--1">
          <p className="mb-0">
            <Link to="pages/profile" className="font-weight-semi-bold">
              Anna
            </Link>{' '}
            attached final-pic.png to this card
          </p>
          <div className="fs--2"> 4 hours ago</div>
        </Media>
      </Media>
    </>
  );
};

export default ModalActivityContent;
