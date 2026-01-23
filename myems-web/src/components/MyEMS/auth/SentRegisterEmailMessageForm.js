import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button, Form, FormGroup, Input, Row, Col, Label, InputGroup, InputGroupAddon } from 'reactstrap';
import withRedirect from '../../../hoc/withRedirect';
import { setItemToStore } from '../../../helpers/utils';
import { withTranslation } from 'react-i18next';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import moment from 'moment';
import { APIBaseURL } from '../../../config';

const SentRegisterEmailMessageForm = ({ setRedirect, setRedirectUrl, hasLabel, layout, t }) => {
  // State
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isdisabled, setIsDisabled] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [inputType, setInputType] = useState('password');
  const [countdown, setCountdown] = useState(60);
  const [phone, setPhone] = useState('');

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    let isResponseOK = false;
    fetch(APIBaseURL + '/users/newusers', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          name: name,
          display_name: displayName,
          email: email,
          password: password,
          verification_code: code,
          phone: phone
        }
      }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        const interval = setInterval(() => {
          setCountdown(prevNumber => prevNumber - 1);
        }, 1000);
        const timerId = setTimeout(() => {
          setIsDisabled(false);
          setCountdown(60);
          clearTimeout(timerId);
          clearInterval(interval);
        }, 1000 * 60);
        if (response.ok) {
          isResponseOK = true;
          return null;
        } else {
          return response.json();
        }
      })
      .then(json => {
        if (isResponseOK) {
          toast.success(t('EMAIL Account registration successful', { EMAIL: email }));
          toast.success(t('Please wait for approval'));
          setRedirect(true);
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        console.log(err);
      });
  };

  // Handler
  const handleCodeSubmit = e => {
    setIsDisabled(true);
    const interval = setInterval(() => {
      setCountdown(prevNumber => {
        if (prevNumber <= 1) {
          clearInterval(interval);
          setIsDisabled(false);
          return 60;
        }
        return prevNumber - 1;
      });
    }, 1000);
    e.preventDefault();
    let isResponseOK = false;
    let subject = 'Create an account';
    let created_datetime = moment()
      .clone()
      .format('YYYY-MM-DDTHH:mm:ss');
    let scheduled_datetime = moment()
      .clone()
      .format('YYYY-MM-DDTHH:mm:ss');
    let message = `
    <html>
    <body>
    <table cellpadding="0" cellspacing="0" width="100%">
        <tbody><tr>
        <td>
        <table cellpadding="0" cellspacing="0" style="border-collapse: collapse;margin: 0 auto;width: 600px;font-size: 14px;line-height:1.4;color: #525967;">
        <tbody><tr>
        <td style="padding-top: 60px;padding-left: 20px;padding-right: 20px;font-size: 14px;line-height:1.4;color: #525967;" colspan="2">
        <b>
    ${email} :</b><br><br>
    ${t('Thanks for verifying your account!.')}
    </td>
        </tr>
        <tr>
        <td colspan="2">
        <div style="margin-top: 20px;margin-bottom: 20px;width: 100%;height: 1px;background-color: #acbdd4;"><br></div></td></tr>
        <tr><td colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;
        <b>${t('Your code is')} {verification_code}.</b>
    <br></td></tr>
        </tbody></table>
        </td>
        </tr>
        </tbody></table>
    </body>
    </html>`;

    fetch(APIBaseURL + '/users/emailmessages', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          subject: subject,
          recipient_email: email,
          phone: phone,
          created_datetime: created_datetime,
          scheduled_datetime: scheduled_datetime,
          message: message
        }
      }),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(response => {
        if (response.ok) {
          isResponseOK = true;
          return null;
        } else {
          return response.json();
        }
      })
      .then(json => {
        if (isResponseOK) {
          toast.success(t('An email has been sent to ') + email);
        } else {
          toast.error(t(json.description));
        }
      })
      .catch(err => {
        const interval = setInterval(() => {
          setCountdown(prevNumber => prevNumber - 1);
        }, 1000);
        const timerId = setTimeout(() => {
          setIsDisabled(false);
          setCountdown(60);
          clearTimeout(timerId);
          clearInterval(interval);
        }, 1000 * 60);
        console.log(err);
      });
  };

  useEffect(() => {
    setRedirectUrl(`/authentication/${layout}/login`);
  }, [setRedirectUrl, layout]);

  useEffect(() => {
    setItemToStore('email', email);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const isPhoneValid = validatePhone(phone);
    setIsSubmitDisabled(!email || !password || !displayName || !name || !code || !phone || !isPhoneValid);
  }, [email, password, displayName, name, code, phone]);

  const toggleVisibility = () => {
    setInputType(inputType === 'password' ? 'text' : 'password');
  };

  const validateEmail = email => {
    const regExp = /^[a-zA-Z0-9]+([._-][a-zA-Z0-9]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z]{2,})+$/;
    const isEmailValid = regExp.test(email);
    const isPhoneValid = validatePhone(phone);
    setIsSubmitDisabled(!isEmailValid || !password || !displayName || !name || !code || !phone || !isPhoneValid);
  };

  const validatePhone = (phoneNum) => {
    return true;
  };

  return (
    <Form className="mt-4" onSubmit={handleSubmit}>
      <FormGroup>
        <Input
          className="form-control"
          placeholder={t('Email address')}
          value={email}
          onChange={({ target }) => {
            validateEmail(target.value);
            setEmail(target.value);
          }}
          type="email"
          required
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
            required
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
          required
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
          required
        />
      </FormGroup>
      <FormGroup>
        <Input
          id="phone"
          placeholder={t('Phone Number')}
          value={phone}
          onChange={({ target }) => {
            validatePhone(target.value);
            setPhone(target.value);
          }}
          type="tel"
          required
        />
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
              maxLength={6}
              required
            />
          </Col>
          <Col xs="6" className="align-items-center d-flex">
            <Button color="primary" onClick={handleCodeSubmit} disabled={isdisabled}>
              {isdisabled ? t('Please wait for NUMBER seconds', { NUMBER: countdown }) : t('Send verification code')}
            </Button>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Button color="primary" block disabled={isSubmitDisabled}>
          {t('Submit')}
        </Button>
      </FormGroup>
    </Form>
  );
};

SentRegisterEmailMessageForm.propTypes = {
  setRedirect: PropTypes.func.isRequired,
  setRedirectUrl: PropTypes.func.isRequired,
  layout: PropTypes.string
};

SentRegisterEmailMessageForm.defaultProps = { layout: 'basic' };

export default withTranslation()(withRedirect(SentRegisterEmailMessageForm));