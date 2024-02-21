import React, { useState, useEffect, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppContext from '../../../context/Context';
import { Button, Form, Row, Col, FormGroup, Input, CustomInput, Label, InputGroup, InputGroupAddon } from 'reactstrap';
import { createCookie, getItemFromStore, setItemToStore, themeColors } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { APIBaseURL, settings } from '../../../config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Captcha from 'react-captcha-code-custom';

const LoginForm = ({ setRedirect, hasLabel, layout, t }) => {
  // State
  const [email, setEmail] = useState(getItemFromStore('email', ''));
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [remember, setRemember] = useState(true);
  const [isDisabled, setIsDisabled] = useState(true);
  const [inputType, setInputType] = useState('password');
  const captchaRef = useRef(null);
  // Context
  const { language, setLanguage, isDark } = useContext(AppContext);

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    let isResponseOK = false;
    if (captchaCode.toLowerCase() !== code.toLowerCase()) {
      toast.error(t('Captcha Error'));
      handleRefreshCaptcha();
      return false;
    }
    fetch(APIBaseURL + '/users/login', {
      method: 'PUT',
      body: JSON.stringify({ data: { email: email, password: password } }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        console.log(response);
        if (response.ok) {
          isResponseOK = true;
          handleRefreshCaptcha();
        }
        return response.json();
      })
      .then(json => {
        console.log(json);
        console.log(isResponseOK);
        if (isResponseOK) {
          createCookie('user_name', json.name, settings.cookieExpireTime);
          createCookie('user_display_name', json.display_name, settings.cookieExpireTime);
          createCookie('user_uuid', json.uuid, settings.cookieExpireTime);
          createCookie('token', json.token, settings.cookieExpireTime);
          createCookie('is_logged_in', true, settings.cookieExpireTime);
          console.log('display_name:');
          toast.success(t('Logged in as ') + json.display_name);
          if (remember) {
            setItemToStore('email', email);
          } else {
            setItemToStore('email', '');
          }
          setRedirect(true);
        } else {
          handleRefreshCaptcha();
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  useEffect(() => {
    setIsDisabled(!email || !password || !code);
  }, [email, password, code]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshCaptcha();
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const toggleVisibility = () => {
    setInputType(inputType === 'password' ? 'text' : 'password');
  };

  const handleRefreshCaptcha = () => {
    setCode('');
    captchaRef.current.refresh();
  };

  return (
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
        {hasLabel && <Label>{t('Password')}</Label>}
        <InputGroup>
          <Input
            placeholder={!hasLabel ? t('Password') : ''}
            value={password}
            maxLength={100}
            className="password-input"
            onChange={({ target }) => setPassword(target.value)}
            type={inputType}
          />
          <InputGroupAddon addonType="append">
            <Button color="secondary" onClick={toggleVisibility}>
              {inputType === 'password' ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </FormGroup>
      <FormGroup>
        <Row className="justify-content-between align-items-center">
          <Col xs="6" className="pr-0">
            {hasLabel && <Label>{t('CaptchaCode')}</Label>}
            <Input
              placeholder={!hasLabel ? t('CaptchaCode') : ''}
              value={code}
              onChange={({ target }) => setCode(target.value)}
              type="text"
            />
          </Col>
          <Col xs="6" className="d-flex pr-0 pl-0">
            <Captcha
              charNum={4}
              width={100}
              height={36}
              bgColor={!isDark ? themeColors.light : themeColors.dark}
              onChange={value => setCaptchaCode(value)}
              ref={captchaRef}
            />
          </Col>
        </Row>
      </FormGroup>
      <Row className="justify-content-between align-items-center">
        <Col xs="auto">
          <CustomInput
            id="customCheckRemember"
            label={t('Remember me')}
            checked={remember}
            onChange={({ target }) => setRemember(target.checked)}
            type="checkbox"
          />
        </Col>
        <Col xs="auto">
          <Link className="fs--1" to={`/authentication/${layout}/sent-forgot-email`}>
            {t('Forgot Password?')}
          </Link>
        </Col>
      </Row>
      <FormGroup>
        <Button color="primary" block className="mt-3" disabled={isDisabled}>
          {t('Log in')}
        </Button>
      </FormGroup>
      <CustomInput
        type="select"
        id="language"
        name="language"
        className="mb-3"
        value={language}
        onChange={({ target }) => setLanguage(target.value)}
      >
        <option value="zh_CN">{t('language-zh_CN')}</option>
        <option value="en">{t('language-en')}</option>
        <option value="de">{t('language-de')}</option>
        <option value="fr">{t('language-fr')}</option>
        <option value="es">{t('language-es')}</option>
        <option value="ru">{t('language-ru')}</option>
        <option value="ar">{t('language-ar')}</option>
        <option value="vi">{t('language-vi')}</option>
        <option value="th">{t('language-th')}</option>
        <option value="tr">{t('language-tr')}</option>
        <option value="ms">{t('language-ms')}</option>
        <option value="id">{t('language-id')}</option>
      </CustomInput>
      <Row className="justify-content-center align-items-center">
        <Col xs="auto">
          {t('New to MyEMS')}?&nbsp;
          <Link className="fs--1" to={`/authentication/${layout}/sent-register-email`}>
            {t('Create an account')}
          </Link>
        </Col>
      </Row>
    </Form>
  );
};

LoginForm.propTypes = {
  setRedirect: PropTypes.func.isRequired,
  layout: PropTypes.string,
  hasLabel: PropTypes.bool
};

LoginForm.defaultProps = {
  layout: 'basic',
  hasLabel: false
};

export default withTranslation()(withRedirect(LoginForm));
