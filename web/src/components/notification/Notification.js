import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import createMarkup from '../../helpers/createMarkup';

const Notification = ({ to, avatar, time, className, unread, flush, emoji, children }) => (
  <Link className={classNames('notification', { 'bg-200': unread, 'notification-flush': flush }, className)} to={to}>
    {avatar && (
      <div className="notification-avatar">
        <Avatar {...avatar} className="mr-3" />
      </div>
    )}
    <div className="notification-body">
      <p className={emoji ? 'mb-1' : 'mb-0'} dangerouslySetInnerHTML={createMarkup(children)} />
      <span className="notification-time">
        {emoji && (
          <span className="mr-1" role="img" aria-label="Emoji">
            {emoji}
          </span>
        )}
        {time}
      </span>
    </div>
  </Link>
);

Notification.propTypes = {
  to: PropTypes.string.isRequired,
  avatar: PropTypes.shape(Avatar.propTypes),
  time: PropTypes.string.isRequired,
  className: PropTypes.string,
  unread: PropTypes.bool,
  flush: PropTypes.bool,
  emoji: PropTypes.string,
  children: PropTypes.node
};

Notification.defaultProps = { unread: false, flush: false };

export default Notification;
