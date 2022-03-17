import React from 'react';
import PropTypes from 'prop-types';
import { Button, Media } from 'reactstrap';
import { Link } from 'react-router-dom';
import Verified from '../common/Verified';
import Avatar from '../common/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ExperienceSummary = ({ imgSrc, headline, company, duration, location, divider, verified, isEditable, to }) => (
  <Media>
    <Link to={to}>
      {imgSrc ? <img className="img-fluid" src={imgSrc} width={56} alt="" /> : <Avatar name={company} size="3xl" />}
    </Link>
    <Media body className="position-relative pl-3 btn-reveal-trigger">
      <h6 className="fs-0 mb-0 d-flex justify-content-between align-items-start">
        <span>
          {headline}
          {verified && <Verified />}
        </span>
        {isEditable && (
          <Button color="link" className="btn-reveal py-0 px-2">
            <FontAwesomeIcon icon="pencil-alt" />
          </Button>
        )}
      </h6>
      <p className="mb-1">
        <Link to={to}>{company}</Link>
      </p>
      <p className="text-1000 mb-0">{duration}</p>
      <p className="text-1000 mb-0">{location}</p>
      {divider && <hr className="border-dashed border-bottom-0" />}
    </Media>
  </Media>
);

ExperienceSummary.propTypes = {
  headline: PropTypes.string.isRequired,
  company: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired,
  imgSrc: PropTypes.string,
  divider: PropTypes.bool,
  verified: PropTypes.bool,
  isEditable: PropTypes.bool
};

ExperienceSummary.defaultProps = {
  divider: true,
  verified: false
};

export default ExperienceSummary;
