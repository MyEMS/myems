import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import ListGroup from 'reactstrap/es/ListGroup';
import ListGroupItem from 'reactstrap/es/ListGroupItem';
import { rawEarlierNotifications, rawNewNotifications } from '../../data/notification/notification';
import { isIterableArray } from '../../helpers/utils';
import useFakeFetch from '../../hooks/useFakeFetch';
import FalconCardHeader from '../common/FalconCardHeader';
import Notification from '../notification/Notification';
import { withTranslation } from 'react-i18next';

const NotificationDropdown = ({ t }) => {
  // State
  const { data: newNotifications, setData: setNewNotifications } = useFakeFetch(rawNewNotifications);
  const { data: earlierNotifications, setData: setEarlierNotifications } = useFakeFetch(rawEarlierNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const [isAllRead, setIsAllRead] = useState(false);

  // Handler
  const handleToggle = e => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const markAsRead = e => {
    e.preventDefault();
    const updatedNewNotifications = newNotifications.map(notification => {
      if (notification.hasOwnProperty('unread')) {
        return {
          ...notification,
          unread: false
        };
      }
      return notification;
    });
    const updatedEarlierNotifications = earlierNotifications.map(notification => {
      if (notification.hasOwnProperty('unread')) {
        return {
          ...notification,
          unread: false
        };
      }
      setIsAllRead(true);
      return notification;
    });

    setNewNotifications(updatedNewNotifications);
    setEarlierNotifications(updatedEarlierNotifications);
  };

  return (
    <Dropdown
      nav
      inNavbar
      isOpen={isOpen}
      toggle={handleToggle}
      onMouseOver={() => {
        let windowWidth = window.innerWidth;
        windowWidth > 992 && setIsOpen(true);
      }}
      onMouseLeave={() => {
        let windowWidth = window.innerWidth;
        windowWidth > 992 && setIsOpen(false);
      }}
    >
      <DropdownToggle
        nav
        className={classNames('px-0', {
          'notification-indicator notification-indicator-primary': !isAllRead
        })}
      >
        <FontAwesomeIcon icon="bell" transform="shrink-6" className="fs-4" />
      </DropdownToggle>
      <DropdownMenu right className="dropdown-menu-card">
        <Card className="card-notification shadow-none" style={{ maxWidth: '20rem' }}>
          <FalconCardHeader className="card-header" title={t('Notifications')} titleTag="h6" light={false}>
            <Link className="card-link font-weight-normal" to="#!" onClick={markAsRead}>
              {t('Mark all as read')}
            </Link>
          </FalconCardHeader>
          <ListGroup flush className="font-weight-normal fs--1">
            <div className="list-group-title">{t('notification_NEW')}</div>
            {isIterableArray(newNotifications) &&
              newNotifications.map((notification, index) => (
                <ListGroupItem key={index} onClick={handleToggle}>
                  <Notification {...notification} flush />
                </ListGroupItem>
              ))}
            <div className="list-group-title">{t('notification_EARLIER')}</div>
            {isIterableArray(earlierNotifications) &&
              earlierNotifications.map((notification, index) => (
                <ListGroupItem key={index} onClick={handleToggle}>
                  <Notification {...notification} flush />
                </ListGroupItem>
              ))}
          </ListGroup>
          <div className="card-footer text-center border-top-0" onClick={handleToggle}>
            <Link className="card-link d-block" to="/notification">
              {t('View all')}
            </Link>
          </div>
        </Card>
      </DropdownMenu>
    </Dropdown>
  );
};

export default withTranslation()(NotificationDropdown);
