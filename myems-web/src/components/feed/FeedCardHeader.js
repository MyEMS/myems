import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Media } from 'reactstrap';
import Avatar from '../common/Avatar';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FeedDropDown from './FeedDropDown';
import FalconCardHeader from '../common/FalconCardHeader';
import classNames from 'classnames';

const FeedCardHeader = ({ name, avatarSrc, time, location, privacy, status, share }) => {
  return (
    <FalconCardHeader
      title={
        <Fragment>
          <Avatar src={avatarSrc} className={status} size="2xl" />
          <Media body className="align-self-center ml-2">
            <p className="mb-1 line-height-1">
              <Link className="font-weight-semi-bold" to="/pages/profile">
                {name}
              </Link>
              {!!share && (
                <span className="ml-1">
                  shared {/^[aeiou]/g.test(share.toLowerCase()) ? 'an' : 'a'} <a href="#!">{share}</a>
                </span>
              )}
            </p>
            <p className="mb-0 fs--1">
              {time} • {location} •{' '}
              <FontAwesomeIcon
                icon={classNames({
                  users: privacy === 'friends',
                  lock: privacy === 'private',
                  'globe-americas': privacy === 'public'
                })}
              />
            </p>
          </Media>
        </Fragment>
      }
      titleTag={Media}
    >
      <FeedDropDown />
    </FalconCardHeader>
  );
};

FeedCardHeader.propsType = {
  name: PropTypes.string.isRequired,
  avatarSrc: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  privacyIcon: PropTypes.string.isRequired,
  status: PropTypes.string,
  share: PropTypes.bool
};

export default FeedCardHeader;
