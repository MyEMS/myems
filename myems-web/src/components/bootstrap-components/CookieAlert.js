import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';
import { createCookie, getCookieValue } from '../../helpers/utils';

const CookieAlert = ({
  visible,
  onDismiss,
  setVisible,
  showOnce,
  autoShow,
  autoShowDelay,
  cookieExpireTime,
  children
}) => {
  useEffect(() => {
    let alertStatus = getCookieValue('showAlert');

    console.log(alertStatus);

    if (alertStatus === null && autoShow) {
      setTimeout(() => {
        setVisible(prev => !prev);
        showOnce && createCookie('showAlert', false, cookieExpireTime);
      }, autoShowDelay);
    }
  }, [showOnce, autoShow, autoShowDelay, cookieExpireTime, setVisible]);

  return (
    <Alert className="notice text-center fs--1 d-flex flex-center" color="light" isOpen={visible} toggle={onDismiss}>
      {children}
    </Alert>
  );
};

CookieAlert.propTypes = {
  autoShow: PropTypes.bool,
  showOnce: PropTypes.bool,
  autoShowDelay: PropTypes.number,
  cookieExpireTime: PropTypes.number,
  children: PropTypes.node
};

CookieAlert.defaultProps = {
  autoShow: true,
  showOnce: true,
  autoShowDelay: 0,
  cookieExpireTime: 7200000
};

export default CookieAlert;
