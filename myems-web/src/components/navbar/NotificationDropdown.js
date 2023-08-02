import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Dropdown, DropdownMenu, DropdownToggle } from 'reactstrap';
import ListGroup from 'reactstrap/es/ListGroup';
import ListGroupItem from 'reactstrap/es/ListGroupItem';
import { rawEarlierNotifications, rawNewNotifications } from '../../data/notification/notification';
import { isIterableArray } from '../../helpers/utils';
import FalconCardHeader from '../common/FalconCardHeader';
import Notification from '../notification/Notification';
import { withTranslation } from 'react-i18next';
import { APIBaseURL } from "../../config";
import moment from 'moment';
import { toast } from "react-toastify";
import { getCookieValue } from '../../helpers/utils';
import alarm from "../../assets/audio/alarm.mp3";
import Lottie from 'react-lottie';
import * as animationData from '../../assets/lottie/bellalert.json'


const NotificationDropdown = ({ t }) => {
  // State
  const [rawNewNotificationschild, setRawNewNotificationschild] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLottieStopped, setIsLottieStopped] = useState(true);

  useEffect(() => {
    let isResponseOK = false;
    fetch(APIBaseURL + '/webmessagesnew', {
      method: 'GET',
      headers: {
        "Content-type": "application/json",
        "User-UUID": getCookieValue('user_uuid'),
        "Token": getCookieValue('token')
      },
      body: null,

    }).then(response => {
      console.log(response);
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
      }).then(json => {
        console.log(json)
      if (isResponseOK) {
        let NewNotificationList = []
        if (json.length > 0) {
              const audio = new Audio(alarm);
              audio.play();
              setIsLottieStopped(false);
              json.forEach((currentValue, index) => {
                let notification = {}
                notification['id'] = json[index]['id'];
                notification['status'] = json[index]['status'];
                notification['subject'] = json[index]['subject']
                notification['message'] = json[index]['message'];
                notification['created_datetime'] = moment(parseInt(json[index]['created_datetime']))
                    .format("YYYY-MM-DD HH:mm:ss");
                if (NewNotificationList.length > 3 ){
                    return true
                }
                if (notification['message'].length > 40){
                  notification['message'] = notification['message'].substring(0,30) + "...";
                }
                if (notification["status"] === "new"){
                  NewNotificationList.push(notification);
                }

              });

          } else {
            setIsLottieStopped(true);
        }
        setRawNewNotificationschild(NewNotificationList);
      }
    }).catch(err => {
      console.log(err);
    });

  }, [t,]);
  console.log(rawNewNotificationschild);


  // Handler
  const handleToggle = e => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const markAsRead = e => {
    e.preventDefault();

    let isResponseOK = false;
    fetch(APIBaseURL + '/webmessagesnew', {
      method: 'PUT',
      headers: {
        "Content-type": "application/json",
        "User-UUID": getCookieValue('user_uuid'),
        "Token": getCookieValue('token')
      },
      body: JSON.stringify({
        "data": {
          "status": 'read'
        }
      }),
      }).then(response => {
      if (response.ok) {
        isResponseOK = true;
        return null;
      } else {
        return response.json();
      }
    }).then(json => {
      console.log(isResponseOK);
      if (isResponseOK) {
        let isResponseOK = false;
        fetch(APIBaseURL + '/webmessagesnew', {
          method: 'GET',
          headers: {
            "Content-type": "application/json",
            "User-UUID": getCookieValue('user_uuid'),
            "Token": getCookieValue('token')
          },
          body: null,

        }).then(response => {
          console.log(response);
          if (response.ok) {
            isResponseOK = true;
          }
          return response.json();
          }).then(json => {
            console.log(json)
            if (isResponseOK) {
              let NewNotificationList = []
              if (json.length > 0) {
                const audio = new Audio(alarm);
                audio.play();
                setIsLottieStopped(false);
                json.forEach((currentValue, index) => {
                  let notification = {}
                  notification['id'] = json[index]['id'];
                  notification['status'] = json[index]['status'];
                  notification['subject'] = json[index]['subject']
                  notification['message'] = json[index]['message'];
                  notification['created_datetime'] = moment(parseInt(json[index]['created_datetime']))
                      .format("YYYY-MM-DD HH:mm:ss");
                  if (NewNotificationList.length > 3 ){
                      return true
                  }
                  if (notification['message'].length > 40){
                    notification['message'] = notification['message'].substring(0,30) + "...";
                  }
                  if (notification["status"] === "new"){
                    NewNotificationList.push(notification);
                  }

                });
              } else {
                setIsLottieStopped(true);
            }
            setRawNewNotificationschild(NewNotificationList);
          }
        }).catch(err => {
          console.log(err);
        });
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
      console.log(err);
    });
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
        className={classNames('px-0')}
      >
        {/* <FontAwesomeIcon icon="bell" transform="shrink-6" className="fs-4" /> */}
        <Lottie options={{loop: true, autoplay: true, animationData: animationData}} isStopped={isLottieStopped} width="50px" height="50px"  />
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
            {isIterableArray(rawNewNotificationschild) &&
              rawNewNotificationschild.map((notification, index) => (
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
