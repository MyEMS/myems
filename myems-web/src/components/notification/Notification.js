import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import createMarkup from '../../helpers/createMarkup';

const Notification = ({ created_datetime, id, status, flush, message, subject}) => (
    <Link className={classNames('notification', { 'bg-200': status, 'notification-flush': flush }, id)}
    to="/notification">
    <div className="notification-body">
      <h5>{subject}</h5><p>{status}</p>
      <p className={'mb-0'} dangerouslySetInnerHTML={createMarkup(message)} />
      <span className="notification-time">{created_datetime}</span>
    </div>
  </Link>
);

Notification.propTypes = {
  created_datetime: PropTypes.string.isRequired,
  id: PropTypes.string,
  status: PropTypes.string,
  subject: PropTypes.string,
  flush: PropTypes.bool,
  message: PropTypes.node
};

Notification.defaultProps = { status: 'acknowledged', flush: false };

export default Notification;
