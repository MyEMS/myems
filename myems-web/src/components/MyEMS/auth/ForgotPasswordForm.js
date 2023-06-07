import React, { useEffect, useState, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { Button, 
  Row,
  Col,
  InputGroupAddon, 
  FormGroup,
  InputGroup,
  Label,
  Input,
  Form } from 'reactstrap';
import FalconCardHeader from '../../common/FalconCardHeader';
import { getItemFromStore, themeColors } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import AppContext from '../../../context/Context';
import Captcha from 'react-captcha-code';
import {FaEye, FaEyeSlash} from 'react-icons/fa'
import { APIBaseURL } from '../../../config';


const ForgotPasswordForm = ({ setRedirect, setRedirectUrl,hasLabel, layout, t }) => {
  const [email, setEmail] = useState(getItemFromStore('email', ''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDisabled, setIsDisabled] = useState(true);
  const [token, setToken] = useState('');
  const [code, setCode] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [inputType, setInputType] = useState('password');
  const [confirmInputType, setConfirmInputType] = useState('password');
  const captchaRef = useRef(null);

  const { isDark } = useContext(AppContext);

  useEffect(() => {
    let isResponseOK = false;
    const searchParams = new URLSearchParams(window.location.search);
    setToken(searchParams.get('token') ? searchParams.get('token') : '');
    setEmail(searchParams.get('email') ? searchParams.get('email') : '');
    fetch(APIBaseURL + '/users/forgotpassword?token='+searchParams.get('token')+'&email='+searchParams.get('email'), {
      method: 'GET',
      headers: {
        "Content-type": "application/json",
      },
      body: null,

    }).then(response => {
      console.log(response);
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
    }).then(json => {
      if (isResponseOK) {

      } else {
        setRedirectUrl(`/authentication/${layout}/sent-forgot-email?expires=true`);
        setRedirect(true);
      }
    }).catch(err => {
      setRedirectUrl(`/authentication/${layout}/sent-forgot-email?expires=true`);
      setRedirect(true);
      console.log(err);
    });
  }, []);

  useEffect(() => {
    if (email === '' || newPassword === '' || confirmPassword === '') {
      return setIsDisabled(true)
    } else {
      setIsDisabled(false);
    };
  }, [email, newPassword, confirmPassword]);

  const handleSubmit = e => {
    e.preventDefault();
    if (captchaCode.toLowerCase() !== code.toLowerCase()) {
      toast.error(t('Captcha Error'));
      handleRefreshCaptcha();
      return false;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('Confirm Password Error'));
      handleRefreshCaptcha();
      return false;
    }
    let isResponseOK = false;
    fetch(APIBaseURL + '/users/forgotpassword', {
      method: 'PUT',
      body: JSON.stringify({
        "data": {
          "password": newPassword, "email": email, "token": token
        }
      }),
      headers: {
        "Content-Type": "application/json",
      }
    }).then(response => {
      console.log(response);
      if (response.ok) {
        isResponseOK = true;
        return null;
      } else {
        return response.json();
      }
    }).then(json => {
      if (isResponseOK) {
        toast.success(t('Password has been changed!'));
        setRedirect(true);
      } else {
        if(json.description == 'API.ADMINISTRATOR_SESSION_TIMEOUT') {
          toast.error(t('It looks like you clicked on an invalid password reset link. Please tryagain.'));
        } else {
          toast.error(t(json.description));
        }
      }
    }).catch(err => {
      console.log(err);
    });
  };
  
  useEffect(() => {
    setRedirectUrl(`/authentication/${layout}/login`);
  }, [setRedirectUrl, layout]);
  
  const handleRefreshCaptcha = () => {
    setCode('');
    captchaRef.current.refresh()
  };

  const toggleVisibility = (flag) => {
    if (flag === 'new') {
      setInputType(inputType === 'password' ? 'text' : 'password');
    } else if (flag === 'confirm') {
      setConfirmInputType(confirmInputType === 'password' ? 'text' : 'password');
    }
  };

  return (
    <>
      <FalconCardHeader title={t('Change Password')} light={false} />
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            {hasLabel && <Label>{t('Email address')}</Label>}
            <Input
              placeholder={!hasLabel ? t('Email address') : ''}
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              type="email"
              autoFocus 
            />
            </FormGroup>
          <FormGroup>
            <InputGroup>
              <Input
                placeholder={!hasLabel ? t('New Password') : ''}
                value={newPassword}
                className="password-input"
                onChange={({ target }) => setNewPassword(target.value)}
                type={inputType}
                maxLength={100}
              />
              <InputGroupAddon addonType="append">
                <Button color="secondary" onClick={() => toggleVisibility('new')}>
                  {inputType === 'password' ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
          <FormGroup>
            <InputGroup>
              <Input
                placeholder={!hasLabel ? t('Confirm Password') : ''}
                value={confirmPassword}
                className="password-input"
                onChange={({ target }) => setConfirmPassword(target.value)}
                type={confirmInputType}
                maxLength={100}
              />
              <InputGroupAddon addonType="append">
                <Button color="secondary" onClick={() => toggleVisibility('confirm')}>
                  {confirmInputType === 'password' ? <FaEyeSlash /> : <FaEye />}
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
           <FormGroup>
            <Row className="justify-content-between align-items-center">
              <Col xs="6" className='pr-0'>
                {hasLabel && <Label>{t('CaptchaCode')}</Label>}
                <Input
                  placeholder={!hasLabel ? t('CaptchaCode') : ''}
                  value={code}
                  onChange={({ target }) => setCode(target.value)}
                  type="text"
                />
              </Col>
              <Col xs="6" className='d-flex pr-0 pl-0'>
                <Captcha
                  codeType={2}
                  charNum={5}
                  width={100}
                  height={36}
                  bgColor={!isDark ? themeColors.light : themeColors.dark}
                  onChange={(value) => setCaptchaCode(value)}
                  ref={captchaRef}
                />
              </Col>
            </Row>
          </FormGroup>
          <Row className="justify-content-between align-items-center">
            <Col xs="9" className='pr-0'>
              <Button color="primary" block disabled={isDisabled}>
                {t('Update Password')}
              </Button>
              </Col>
            <Col xs="3">
              <Link className="fs--1" to={`/authentication/${layout}/login`}>
                {t('Return to Login')}
              </Link>
            </Col>
          </Row>
        </Form>
    </>
  );
};

ForgotPasswordForm.propTypes = {
  setRedirect: PropTypes.func.isRequired,
  setRedirectUrl: PropTypes.func.isRequired,
  layout: PropTypes.string
};

ForgotPasswordForm.defaultProps = { layout: 'basic' };

export default withTranslation()(withRedirect(ForgotPasswordForm));