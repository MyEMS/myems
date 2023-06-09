import React, { useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import AppContext from '../../../context/Context';
import { Button, Form, FormGroup, Input, Row, Col, Label, InputGroup, InputGroupAddon } from 'reactstrap';
import withRedirect from '../../../hoc/withRedirect';
import { themeColors } from '../../../helpers/utils';
import { withTranslation } from 'react-i18next';
import Captcha from 'react-captcha-code';
import {FaEye, FaEyeSlash} from 'react-icons/fa';
import { APIBaseURL } from '../../../config';

const RegisterAccountForm = ({ setRedirect, setRedirectUrl, hasLabel, layout, t }) => {
  // State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [prompt, setPrompt] = useState('');
  const captchaRef = useRef(null);
  const { isDark } = useContext(AppContext);
  const [isDisabled, setIsDisabled] = useState(false);
  const [token, setToken] = useState('');
  const [inputType, setInputType] = useState('password');

  useEffect(() => {
    let isResponseOK = false;
    const searchParams = new URLSearchParams(window.location.search);
    setToken(searchParams.get('token') ? searchParams.get('token') : '');
    setEmail(searchParams.get('email').split('"')[0] ? searchParams.get('email').split('"')[0] : '');
    fetch(APIBaseURL + '/users/emailmessagesessions?token='+searchParams.get('token')+'&email='+searchParams.get('email').split('"')[0], {
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
        setRedirectUrl(`/authentication/${layout}/sent-register-email?expires=true`);
        setRedirect(true);
      }
    }).catch(err => {
      setRedirectUrl(`/authentication/${layout}/sent-register-email?expires=true`);
      setRedirect(true);
      console.log(err);
    });
  }, []);

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    let isResponseOK = false;
    if (captchaCode.toLowerCase() !== code.toLowerCase()) {
      toast.error(t('Captcha Error'));
      handleRefreshCaptcha();
      return false;
    }
    fetch(APIBaseURL + '/users/newusers', {
      method: 'POST',
      body: JSON.stringify({ "data":
        { "name": name,
          "display_name": displayName,
          "email": email,
          "password": password,
          "token": token
        }
      }),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      if (response.ok) {
        isResponseOK = true;
        handleRefreshCaptcha();
        return null
      } else {
        return response.json();
      }
    }).then(json => {
      if (isResponseOK) {
        toast.success(t('EMAIL Account registration successful', {'EMAIL': email}));
        setRedirect(true);
      } else {
        handleRefreshCaptcha();
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
    setRedirectUrl(`/authentication/${layout}/login`);
  }, [setRedirectUrl, layout]);

  useEffect(()=>{
    const searchParams = new URLSearchParams(window.location.search);
    setEmail(searchParams.get('email').split('"')[0]);
    setToken(searchParams.get('token'));
  })

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshCaptcha();
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setIsDisabled(!email || !password || !displayName || !name || !code);
  }, [email, password, displayName, name, code]);

  const handleRefreshCaptcha = () => {
    setCode('');
    captchaRef.current.refresh()
  };

  const toggleVisibility = () => {
    setInputType(inputType === 'password' ? 'text' : 'password');
  };

  const validateEmail = (email) => {
    const regExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (regExp.test(email)) {
      setIsDisabled(true);
      setPrompt('');
    } else {
      setIsDisabled(false);
      setPrompt(t("API.INVALID_EMAIL"));
    }
  }

  const validateCaptchaCode = (code) => {
    
  }

  return (
    <Form className="mt-4" onSubmit={handleSubmit}>
      <FormGroup>
        <Input
          className="form-control"
          readOnly={true}
          placeholder={t('Email address')}
          value={email}
          onChange={({ target }) =>{validateEmail(target.value);setEmail(target.value)}}
          type="email"
        />
      </FormGroup>
      <FormGroup>
        <InputGroup>
          <Input
              id="password"
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
        <Input
            id="name"
            placeholder={t('UserName')}
            value={name}
            maxLength={30}
            onChange={({ target }) => setName(target.value)}
            type="text"
        />
      </FormGroup>
      <FormGroup>
        <Input
            id="display_name"
            placeholder={t('DisplayName')}
            value={displayName}
            maxLength={30}
            onChange={({ target }) => setDisplayName(target.value)}
            type="text"
        />
      </FormGroup>
      <FormGroup>
        <Row className="justify-content-between align-items-center">
          <Col xs="6" className='pr-0'>
            {hasLabel && <Label>{t('CaptchaCode')}</Label>}
            <Input
              placeholder={!hasLabel ? t('CaptchaCode') : ''}
              value={code}
              onChange={({ target }) => {validateCaptchaCode(target.value);setCode(target.value)}}
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
              onChange={(value) => {setCaptchaCode(value)}}
              ref={captchaRef}
            />
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Button color="primary" block disabled={isDisabled}>
          {t('Submit')}
        </Button>
      </FormGroup>      
      <Row className="justify-content-center align-items-center">
        <Col xs="auto">
          {t(prompt)}
        </Col>
      </Row>
    </Form>
  );
};

RegisterAccountForm.propTypes = {
  setRedirect: PropTypes.func.isRequired,
  setRedirectUrl: PropTypes.func.isRequired,
  layout: PropTypes.string
};

RegisterAccountForm.defaultProps = { layout: 'basic' };

export default withTranslation()(withRedirect(RegisterAccountForm));