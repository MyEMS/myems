import React, { useState, useEffect, useRef, useContext } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import AppContext from '../../../context/Context';
import { Button, Form, FormGroup, Input, Row, Col, Label } from 'reactstrap';
import withRedirect from '../../../hoc/withRedirect';
import { setItemToStore, themeColors } from '../../../helpers/utils';
import { withTranslation } from 'react-i18next';
import Captcha from 'react-captcha-code';
import moment from 'moment';
import { APIBaseURL } from '../../../config';

const SentRegisterEmailMessageForm = ({ setRedirect, setRedirectUrl, hasLabel, layout, t }) => {
  // State
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const captchaRef = useRef(null);

  const { isDark } = useContext(AppContext);

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    let isResponseOK = false;
    if (captchaCode.toLowerCase() !== code.toLowerCase()) {
      toast.error(t('Captcha Error'));
      handleRefreshCaptcha();
      return false;
    }
    let subject = "Create an account";
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
    ${t("The link to register your account is as follows. \
      Please click the link within 60 minutes to proceed with the next step. \
      If you did not request this action, please disregard this email.")}
    </td>
        </tr>
        <tr>
        <td colspan="2">
        <div style="margin-top: 20px;margin-bottom: 20px;width: 100%;height: 1px;background-color: #acbdd4;"><br></div></td></tr>
        <tr><td colspan="2">&nbsp;&nbsp;&nbsp;&nbsp; 
     <a href="${window.location.href.split(layout)[0]}${layout}/register-account?token={token}&email=${email}" style="display: block;" target="_blank">
    ${t('Please click on the included link to register your account')}
    </a><br></td></tr>
        </tbody></table>
        </td>
        </tr>
        </tbody></table>
    </body>
    </html>`;
    
    fetch(APIBaseURL + '/users/emailmessages', {
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
      if (response.ok) {
        isResponseOK = true;
        handleRefreshCaptcha();
        return null
      } else {
        return response.json();
      }
    }).then(json => {
      if (isResponseOK) {
        toast.success(t('An email has been sent to ') + email );
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
    setRedirectUrl(`/authentication/${layout}/confirm-mail`);
  }, [setRedirectUrl, layout]);

  useEffect(() => {
    setItemToStore('email', email);
    // eslint-disable-next-line
  }, [email]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleRefreshCaptcha();
    }, 1000 * 60);
    return () => clearInterval(interval);
  }, []);

  const handleRefreshCaptcha = () => {
    setCode('');
    captchaRef.current.refresh()
  };

  return (
    <Form className="mt-4" onSubmit={handleSubmit}>
      <FormGroup>
        <Input
          className="form-control"
          placeholder={t('Email address')}
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          type="email"
        />
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
      <FormGroup>
        <Button color="primary" block disabled={!email}>
          {t('Submit')}
        </Button>
      </FormGroup>
      {/* <Link className="fs--1 text-600" to="#!">
        I can't recover my account using this page
        <span className="d-inline-block ml-1">&rarr;</span>
      </Link> */}
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