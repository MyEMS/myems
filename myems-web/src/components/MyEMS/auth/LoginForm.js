import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import AppContext from '../../../context/Context';
import { Button, Form, Row, Col, FormGroup, Input, CustomInput, Label } from 'reactstrap';
import { createCookie, getItemFromStore, setItemToStore } from '../../../helpers/utils';
import withRedirect from '../../../hoc/withRedirect';
import { withTranslation } from 'react-i18next';
import { APIBaseURL } from '../../../config';


const LoginForm = ({ setRedirect, hasLabel, layout, t }) => {
  // State
  const [email, setEmail] = useState(getItemFromStore('email', ''));
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [isDisabled, setIsDisabled] = useState(true);
  // Context
  const { language, setLanguage } = useContext(AppContext);

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    let isResponseOK = false;
    fetch(APIBaseURL + '/users/login', {
      method: 'PUT',
      body: JSON.stringify({ "data": { "email": email, "password": password } }),
      headers: { "Content-Type": "application/json" }
    }).then(response => {
      console.log(response);
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
    }).then(json => {
      console.log(json);
      console.log(isResponseOK);
      if (isResponseOK) {
        createCookie('user_name', json.name, 1000 * 60 * 10 * 1);
        createCookie('user_display_name', json.display_name, 1000 * 60 * 10 * 1);
        createCookie('user_uuid', json.uuid, 1000 * 60 * 10 * 1);
        createCookie('token', json.token, 1000 * 60 * 10 * 1);
        createCookie('is_logged_in', true, 1000 * 60 * 10 * 1);
        console.log("display_name:");
        toast.success(t('Logged in as ') + json.display_name);
        if (remember) {
          setItemToStore('email', email);
        } else {
          setItemToStore('email', '');
        }
        setRedirect(true);
      } else {
        toast.error(t(json.description));
      }
    }).catch(err => {
      console.log(err);
    });

  };

  useEffect(() => {
    setIsDisabled(!email || !password);
  }, [email, password]);

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
        <Input
          placeholder={!hasLabel ? t('Password') : ''}
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          type="password"
        />
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
          <Link className="fs--1" to={`/authentication/${layout}/forget-password`}>
            {t('Forget Password?')}
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
      </CustomInput>
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
