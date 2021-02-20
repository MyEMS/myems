import React from 'react';
import PropTypes from 'prop-types';
import { Button, Media } from 'reactstrap';
import { Link } from 'react-router-dom';
import Verified from '../common/Verified';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Avatar from '../common/Avatar';

const EducationSummary = ({ imgSrc, institution, degree, duration, location, divider, verified, isEditable, to }) => (
  <Media>
    <Link to={to}>
      {imgSrc ? <img className="img-fluid" src={imgSrc} width={56} alt="" /> : <Avatar name={institution} size="3xl" />}
    </Link>
    <Media body className="position-relative pl-3 btn-reveal-trigger">
      <h6 className="fs-0 mb-0 d-flex justify-content-between align-items-start">
        <Link to={to}>
          {institution}
          {verified && <Verified />}
        </Link>
        {isEditable && (
          <Button color="link" className="btn-reveal py-0 px-2">
            <FontAwesomeIcon icon="pencil-alt" />
          </Button>
        )}
      </h6>
      <p className="mb-1">{degree}</p>
      <p className="text-1000 mb-0">{duration}</p>
      <p className="text-1000 mb-0">{location}</p>
      {divider && <hr className="border-dashed border-bottom-0" />}
    </Media>
  </Media>
);

EducationSummary.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  institution: PropTypes.string.isRequired,
  degree: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  divider: PropTypes.bool,
  verified: PropTypes.bool,
  isEditable: PropTypes.bool
};

EducationSummary.defaultProps = {
  divider: true,
  verified: false
};

export default EducationSummary;
