import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import envelope from '../../../assets/img/illustrations/envelope.png';
import { withTranslation } from 'react-i18next';

const ConfirmMailContent = ({ email, layout, titleTag: TitleTag, t }) => (
  <Fragment>
    <img className="d-block mx-auto mb-4" src={envelope} alt="sent" width={70} />
    <TitleTag>{t('Please check your email!')}</TitleTag>
    <p>
      {t('An email has been sent to ')}
      <strong>{email}</strong>.
    </p>
    <Button tag={Link} color="primary" size="sm" className="mt-3" to={`/authentication/${layout}/login`}>
      <FontAwesomeIcon icon="chevron-left" transform="shrink-4 down-1" className="mr-1" />
      {t('Return to Login')}
    </Button>
  </Fragment>
);

ConfirmMailContent.propTypes = {
  email: PropTypes.string.isRequired,
  layout: PropTypes.string,
  titleTag: PropTypes.string
};

ConfirmMailContent.defaultProps = { layout: 'basic', titleTag: 'h4' };

export default withTranslation()(ConfirmMailContent);
