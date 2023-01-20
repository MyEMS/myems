import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import { Button, Form, FormGroup, Input } from 'reactstrap';
import withRedirect from '../../../hoc/withRedirect';
import { getItemFromStore, setItemToStore } from '../../../helpers/utils';
import { withTranslation } from 'react-i18next';

const ForgetPasswordForm = ({ setRedirect, setRedirectUrl, layout, t }) => {
  // State
  const [email, setEmail] = useState(getItemFromStore('email', ''));

  // Handler
  const handleSubmit = e => {
    e.preventDefault();
    if (email) {
      toast.success(t('An email with password reset link is sent to ') + email );
      setRedirect(true);
    }
  };

  useEffect(() => {
    setRedirectUrl(`/authentication/${layout}/confirm-mail`);
  }, [setRedirectUrl, layout]);

  useEffect(() => {
    setItemToStore('email', email);
    // eslint-disable-next-line
  }, [email]);

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
        <Button color="primary" block disabled={!email}>
          {t('Send reset link')}
        </Button>
      </FormGroup>
      {/* <Link className="fs--1 text-600" to="#!">
        I can't recover my account using this page
        <span className="d-inline-block ml-1">&rarr;</span>
      </Link> */}
    </Form>
  );
};

ForgetPasswordForm.propTypes = {
  setRedirect: PropTypes.func.isRequired,
  setRedirectUrl: PropTypes.func.isRequired,
  layout: PropTypes.string
};

ForgetPasswordForm.defaultProps = { layout: 'basic' };

export default withTranslation()(withRedirect(ForgetPasswordForm));
