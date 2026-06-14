import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Button, Card, CardBody, Col, Form, FormGroup, Input, InputGroup, InputGroupAddon, Label, Row } from 'reactstrap';
import FalconCardHeader from '../../common/FalconCardHeader';
import { getCookieValue, createCookie, checkEmpty, handleAPIError } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { APIBaseURL, settings } from '../../../config';

const ChangePasswordForm = ({ setRedirect, setRedirectUrl, layout, t }) => {
  const history = useHistory();
  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (checkEmpty(is_logged_in) || checkEmpty(token) || checkEmpty(user_uuid) || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      //update expires time of cookies
      createCookie('is_logged_in', true, settings.cookieExpireTime);
      createCookie('user_name', user_name, settings.cookieExpireTime);
      createCookie('user_display_name', user_display_name, settings.cookieExpireTime);
      createCookie('user_uuid', user_uuid, settings.cookieExpireTime);
      createCookie('token', token, settings.cookieExpireTime);
    }
  });

  useEffect(() => {
    let timer = setInterval(() => {
      let is_logged_in = getCookieValue('is_logged_in');
      if (is_logged_in === null || !is_logged_in) {
        setRedirectUrl(`/authentication/basic/login`);
        setRedirect(true);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [setRedirectUrl, setRedirect]);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  useEffect(() => {
    if (oldPassword === '' || newPassword === '' || confirmPassword === '') return setIsDisabled(true);

    setIsDisabled(newPassword !== confirmPassword);
  }, [oldPassword, newPassword, confirmPassword]);

  const togglePasswordVisibility = field => {
    setPasswordVisible(currentState => ({
      ...currentState,
      [field]: !currentState[field]
    }));
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      history.goBack();
      return;
    }

    setRedirectUrl(`/`);
    setRedirect(true);
  };

  const renderPasswordInput = ({ id, label, value, onChange, visibleKey, autoComplete }) => (
    <FormGroup>
      <Label htmlFor={id}>{label}</Label>
      <InputGroup>
        <Input
          id={id}
          value={value}
          maxLength={100}
          onChange={onChange}
          className="border-right-0"
          type={passwordVisible[visibleKey] ? 'text' : 'password'}
          autoComplete={autoComplete}
        />
        <InputGroupAddon addonType="append">
          <Button
            color="link"
            className="bg-white border-0 px-3 text-500"
            onClick={() => togglePasswordVisibility(visibleKey)}
            type="button"
            style={{ boxShadow: 'none' }}
            aria-label={passwordVisible[visibleKey] ? 'Hide password' : 'Show password'}
          >
            {passwordVisible[visibleKey] ? <FaEyeSlash /> : <FaEye />}
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </FormGroup>
  );

  const handleSubmit = e => {
    e.preventDefault();
    let isResponseOK = false;
    fetch(APIBaseURL + '/users/changepassword', {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          old_password: oldPassword,
          new_password: newPassword
        }
      }),
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      }
    })
      .then(response => {
        //
        if (response.ok) {
          isResponseOK = true;
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          toast.success(t('Password has been changed!'));
          setRedirect(true);
        } else {
          handleAPIError(json, setRedirect, setRedirectUrl, t, toast);
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  useEffect(() => {
    setRedirectUrl(`/`);
  }, [setRedirectUrl, layout]);

  return (
    <Card className="mb-3">
      <FalconCardHeader title={t('Change Password')} light={false} />
      <CardBody className="bg-light">
        <Form onSubmit={handleSubmit}>
          {renderPasswordInput({
            id: 'old-password',
            label: t('Old Password'),
            value: oldPassword,
            onChange: ({ target }) => setOldPassword(target.value),
            visibleKey: 'oldPassword',
            autoComplete: 'current-password'
          })}
          {renderPasswordInput({
            id: 'new-password',
            label: t('New Password'),
            value: newPassword,
            onChange: ({ target }) => setNewPassword(target.value),
            visibleKey: 'newPassword',
            autoComplete: 'new-password'
          })}
          {renderPasswordInput({
            id: 'confirm-password',
            label: t('Confirm Password'),
            value: confirmPassword,
            onChange: ({ target }) => setConfirmPassword(target.value),
            visibleKey: 'confirmPassword',
            autoComplete: 'new-password'
          })}
          <Row>
            <Col xs="12" md="6" className="mb-2 mb-md-0">
              <Button color="secondary" block onClick={handleBack} type="button">
                {t('Back')}
              </Button>
            </Col>
            <Col xs="12" md="6">
              <Button color="primary" block disabled={isDisabled} type="submit">
                {t('Update Password')}
              </Button>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  );
};

ChangePasswordForm.propTypes = {
  setRedirect: PropTypes.func.isRequired,
  setRedirectUrl: PropTypes.func.isRequired,
  layout: PropTypes.string
};

ChangePasswordForm.defaultProps = { layout: 'basic' };

export default withTranslation()(withRedirect(ChangePasswordForm));
