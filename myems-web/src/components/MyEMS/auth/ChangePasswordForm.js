import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button, 
  Card, 
  CardBody, 
  Form } from 'reactstrap';
import FalconCardHeader from '../../common/FalconCardHeader';
import FormGroupInput from '../../common/FormGroupInput';
import { getCookieValue, createCookie } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { APIBaseURL } from '../../../config';


const ChangePasswordForm = ({ setRedirect, setRedirectUrl, layout, t }) => {
  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    let user_name = getCookieValue('user_name');
    let user_display_name = getCookieValue('user_display_name');
    let user_uuid = getCookieValue('user_uuid');
    let token = getCookieValue('token');
    if (is_logged_in === null || !is_logged_in) {
      setRedirectUrl(`/authentication/basic/login`);
      setRedirect(true);
    } else {
      //update expires time of cookies
      createCookie('is_logged_in', true, 1000 * 60 * 10 * 1);
      createCookie('user_name', user_name, 1000 * 60 * 10 * 1);
      createCookie('user_display_name', user_display_name, 1000 * 60 * 10 * 1);
      createCookie('user_uuid', user_uuid, 1000 * 60 * 10 * 1);
      createCookie('token', token, 1000 * 60 * 10 * 1);
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
  }, []);
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (oldPassword === '' || newPassword === '' || confirmPassword === '') return setIsDisabled(true);

    setIsDisabled(newPassword !== confirmPassword);
  }, [oldPassword, newPassword, confirmPassword]);

  const handleSubmit = e => {
    e.preventDefault();
    let isResponseOK = false;
    fetch(APIBaseURL + '/users/changepassword', {
      method: 'PUT',
      body: JSON.stringify({
        "data": {
          "old_password": oldPassword, "new_password": newPassword
        }
      }),
      headers: {
        "Content-Type": "application/json",
        "User-UUID": getCookieValue('user_uuid'),
        "Token": getCookieValue('token')
      }
    }).then(response => {
      console.log(response);
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
    }).then(json => {
      console.log(isResponseOK);
      if (isResponseOK) {
        toast.success(t('Password has been changed!'));
        setRedirect(true);
      } else {
        toast.error(t(json.description))
      }
    }).catch(err => {
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
          <FormGroupInput
            id="old-password"
            label={t('Old Password')}
            value={oldPassword}
            onChange={({ target }) => setOldPassword(target.value)}
            type="password"
          />
          <FormGroupInput
            id="new-password"
            label={t('New Password')}
            value={newPassword}
            onChange={({ target }) => setNewPassword(target.value)}
            type="password"
          />
          <FormGroupInput
            id="confirm-password"
            label={t('Confirm Password')}
            value={confirmPassword}
            onChange={({ target }) => setConfirmPassword(target.value)}
            type="password"
          />
          <Button color="primary" block disabled={isDisabled}>
            {t('Update Password')}
          </Button>
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
