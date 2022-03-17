import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Media } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const BirthdayNotice = ({ name, profileLink, className }) => {
  return (
    <Card className={`mt-3 mt-lg-0 ${className}`}>
      <CardBody className="fs--1">
        <Media>
          <FontAwesomeIcon icon="gift" className="fs-0 text-warning" />
          <Media body className="ml-2">
            <Link className="font-weight-semi-bold" to={profileLink}>
              {name}
            </Link>
            's Birthday is today
          </Media>
        </Media>
      </CardBody>
    </Card>
  );
};

BirthdayNotice.propTypes = {
  name: PropTypes.string.isRequired,
  profileLink: PropTypes.string.isRequired,
  className: PropTypes.string
};

export default BirthdayNotice;
