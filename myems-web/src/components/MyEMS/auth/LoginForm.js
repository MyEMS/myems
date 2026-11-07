import React, { useState, useEffect, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppContext from '../../../context/Context';
import {
  Button,
  Form,
  FormGroup,
  Input,
  CustomInput,
  Label,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from 'reactstrap';
import { createCookie, getItemFromStore, setItemToStore, themeColors } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { APIBaseURL, settings } from '../../../config';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Captcha from 'react-captcha-code-custom';

const LoginForm = ({ setRedirect, hasLabel, layout, t }) => {
  // State
  const [loginAccount, setLoginAccount] = useState(getItemFromStore('loginAccount', ''));
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [remember, setRemember] = useState(true);
  const [isDisabled, setIsDisabled] = useState(true);
  const [passwordVisible, setPasswordVisible] = useState(false);
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
      body: JSON.stringify({ data: { account: loginAccount, password: password } }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
          handleRefreshCaptcha();
        }
        return response.json();
      })
      .then(json => {
        if (isResponseOK) {
          createCookie('user_name', json.name, settings.cookieExpireTime);
          createCookie('user_display_name', json.display_name, settings.cookieExpireTime);
          createCookie('user_uuid', json.uuid, settings.cookieExpireTime);
          createCookie('token', json.token, settings.cookieExpireTime);
          createCookie('is_logged_in', true, settings.cookieExpireTime);
          toast.success(t('Logged in as ') + json.display_name);
          if (remember) {
            setItemToStore('loginAccount', loginAccount);
          } else {
            setItemToStore('loginAccount', '');
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
    setIsDisabled(!loginAccount || !password || !code);
  }, [loginAccount, password, code]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshCaptcha();
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const togglePasswordVisibility = () => {
    setPasswordVisible(currentState => !currentState);
  };

  const handleRefreshCaptcha = () => {
    setCode('');
    captchaRef.current.refresh();
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        {hasLabel && <Label>{`${t('UserName')} / ${t('Email address')} / ${t('Phone Number')}`}</Label>}
        <Input
          placeholder={!hasLabel ? `${t('UserName')} / ${t('Email address')} / ${t('Phone Number')}` : ''}
          value={loginAccount}
          onChange={({ target }) => setLoginAccount(target.value.trim())}
          autoFocus
        />
      </FormGroup>
      <FormGroup>
        {hasLabel && <Label>{t('Password')}</Label>}
        <div className="position-relative">
          <Input
            placeholder={!hasLabel ? t('Password') : ''}
            value={password}
            maxLength={100}
            className="password-input"
            onChange={({ target }) => setPassword(target.value)}
            type={passwordVisible ? 'text' : 'password'}
          />
          <Button
            color="link"
            className="absolute-vertical-center r-0 bg-transparent border-0 shadow-none px-3 py-0 text-500"
            onClick={togglePasswordVisibility}
            type="button"
            aria-label={t(passwordVisible ? 'Hide password' : 'Show password')}
          >
            {passwordVisible ? <FaEye /> : <FaEyeSlash />}
          </Button>
        </div>
      </FormGroup>
      <FormGroup>
        {hasLabel && <Label>{t('CaptchaCode')}</Label>}
        <InputGroup>
          <Input
            placeholder={!hasLabel ? t('CaptchaCode') : ''}
            value={code}
            onChange={({ target }) => setCode(target.value.trim())}
            type="text"
          />
          <InputGroupAddon addonType="append">
            <InputGroupText className={`p-0 overflow-hidden ${isDark ? 'bg-dark' : 'bg-white'}`}>
              <Captcha
                charNum={4}
                width={116}
                height={34}
                fontSize={20}
                className="d-block"
                bgColor={!isDark ? themeColors.light : themeColors.dark}
                onChange={value => setCaptchaCode(value)}
                ref={captchaRef}
              />
            </InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </FormGroup>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <CustomInput
          id="customCheckRemember"
          label={t('Remember me')}
          bsSize="sm"
          className="mb-0"
          checked={remember}
          onChange={({ target }) => setRemember(target.checked)}
          type="checkbox"
        />
        <Link className="fs--1 text-nowrap" to={`/authentication/${layout}/sent-forgot-email`}>
          {t('Forgot Password?')}
        </Link>
      </div>
      <FormGroup>
        <Button color="primary" block className="py-2 font-weight-semi-bold" disabled={isDisabled}>
          {t('Log in')}
        </Button>
      </FormGroup>
      <CustomInput
        type="select"
        id="language"
        name="language"
        className="mb-4"
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
        <option value="zh_TW">{t('language-zh_TW')}</option>
        <option value="pt">{t('language-pt')}</option>
        <option value="ko_KR">{t('language-ko_KR')}</option>
        <option value="it">{t('language-it')}</option>
        <option value="pol">{t('language-pol')}</option>
        <option value="nl">{t('language-nl')}</option>
        <option value="jp">{t('language-jp')}</option>
        <option value="fa">{t('language-fa')}</option>
      </CustomInput>
      <div className="text-center border-top pt-3">
        <span className="text-600">{t('New to MyEMS')}? </span>
        <Link className="font-weight-semi-bold" to={`/authentication/${layout}/sent-register-email`}>
          {t('Create an account')}
        </Link>
      </div>
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
