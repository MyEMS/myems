import React, { useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button, Form, FormGroup, Input, Row, Col, Label, InputGroup, InputGroupAddon } from 'reactstrap';
import withRedirect from '../../../hoc/withRedirect';
import { getItemFromStore, setItemToStore } from '../../../helpers/utils';
import { withTranslation } from 'react-i18next';
import {FaEye, FaEyeSlash} from 'react-icons/fa';
import moment from 'moment';
import { APIBaseURL } from '../../../config';

const SentForgotPasswordEmailMessageForm = ({ setRedirect, setRedirectUrl, hasLabel, layout, t }) => {
  // State
  const [email, setEmail] = useState(getItemFromStore('email', ''));
  const [code, setCode] = useState('');
  const [isdisabled, setIsDisabled] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [password, setPassword] = useState('');
  const [inputType, setInputType] = useState('password');
  const [number, setNumber] = useState(60);

     // Handler
     const handleSubmit = e => {
      e.preventDefault();
      let isResponseOK = false;
      fetch(
        APIBaseURL +
          '/users/forgotpassword', {
        method: 'PUT',
        body: JSON.stringify({ "data":
          {
            "email": email,
            "password": password,
            "verification_code": code
          }
        }),
        headers: { "Content-Type": "application/json" }
      }).then(response => {
        if (response.ok) {
          isResponseOK = true;
          return null
        } else {
          return response.json();
        }
      }).then(json => {
        if (isResponseOK) {
          toast.success(t('Password has been changed!'));
          setRedirect(true);
        } else {
          toast.error(t(json.description));
        }
      }).catch(err => {
        console.log(err);
      });
    };

  // Handler
  const handleCodeSubmit = e => {
    setIsDisabled(true);
    let isResponseOK = false;
    e.preventDefault();
    let subject = "Forgot Password";
    let created_datetime = moment().clone().format('YYYY-MM-DDTHH:mm:ss');
    let scheduled_datetime = moment().clone().format('YYYY-MM-DDTHH:mm:ss');
    let message =
    `
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
    ${t("Thanks for verifying your account!.")}
    </td>
        </tr>
        <tr>
        <td colspan="2">
        <div style="margin-top: 20px;margin-bottom: 20px;width: 100%;height: 1px;background-color: #acbdd4;"><br></div></td></tr>
        <tr><td colspan="2">&nbsp;&nbsp;&nbsp;&nbsp;
        <b>${t("Your code is")} {verification_code}.</b>
    <br></td></tr>
        </tbody></table>
        </td>
        </tr>
        </tbody></table>
    </body>
    </html>`;

    fetch(
      APIBaseURL +
        '/users/emailmessages', {
      method: 'POST',
      body: JSON.stringify({ "data":
        { "subject": subject,
          "recipient_email": email,
          "created_datetime": created_datetime,
          "scheduled_datetime": scheduled_datetime,
          "message": message,
        }
      }),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      const interval = setInterval(() => {
        setNumber((prevNumber) => prevNumber - 1)
      }, 1000);
      const timerId = setTimeout(() => {
        setIsDisabled(false);
        setNumber(60);
        clearTimeout(timerId);
        clearInterval(interval);
      }, 1000 * 60);
      if (response.ok) {
        isResponseOK = true;
        return null
      } else {
        return response.json();
      }
    }).then(json => {
      if (isResponseOK) {
        toast.success(t('An email has been sent to ') + email );
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      const interval = setInterval(() => {
        setNumber((prevNumber) => prevNumber - 1)
      }, 1000);
      const timerId = setTimeout(() => {
        setIsDisabled(false);
        setNumber(60);
        clearTimeout(timerId);
        clearInterval(interval);
      }, 1000 * 60);
      console.log(err);
    });
  };

  useEffect(() => {
    setRedirectUrl(`/authentication/${layout}/login`);
  }, [setRedirectUrl, layout]);

  const validateEmail = (email) => {
    const regExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (regExp.test(email)) {
      setIsSubmitDisabled(true);
    } else {
      setIsSubmitDisabled(false);
    }
  }

  useEffect(() => {
    setIsSubmitDisabled(!email || !password || !code);
  }, []);

  const toggleVisibility = () => {
    setInputType(inputType === 'password' ? 'text' : 'password');
  };

  useEffect(() => {
    setItemToStore('email', email);
    // eslint-disable-next-line
  }, []);

  return (
    <Form className="mt-4" onSubmit={handleSubmit}>
      <FormGroup>
        <Input
          className="form-control"
          placeholder={t('Email address')}
          value={email}
          onChange={({ target }) =>{validateEmail(target.value); setEmail(target.value)}}
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
        <Row className="justify-content-between align-items-center">
          <Col xs="6" className='pr-0'>
            {hasLabel && <Label>{t('CaptchaCode')}</Label>}
            <Input
              placeholder={!hasLabel ? t('CaptchaCode') : ''}
              value={code}
              onChange={({ target }) => setCode(target.value)}
              type="text"
              maxLength={6}
            />
          </Col>
          <Col xs="6" className='align-items-center d-flex'>
            <Button color="primary"
            onClick={handleCodeSubmit}
            disabled={isdisabled}>
              {isdisabled ? t('Please wait for NUMBER seconds', {'NUMBER': number}) : t('Send verification code')}
            </Button>
          </Col>
        </Row>
      </FormGroup>
      <FormGroup>
        <Button color="primary" block disabled={isSubmitDisabled}>
          {t('Reset Password')}
        </Button>
      </FormGroup>
      {/* <Link className="fs--1 text-600" to="#!">
        I can't recover my account using this page
        <span className="d-inline-block ml-1">&rarr;</span>
      </Link> */}
    </Form>
  );
};

SentForgotPasswordEmailMessageForm.propTypes = {
  setRedirect: PropTypes.func.isRequired,
  setRedirectUrl: PropTypes.func.isRequired,
  layout: PropTypes.string
};

SentForgotPasswordEmailMessageForm.defaultProps = { layout: 'basic' };

export default withTranslation()(withRedirect(SentForgotPasswordEmailMessageForm));