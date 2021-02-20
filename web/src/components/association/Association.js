import React from 'react';
import PropTypes from 'prop-types';
import { Media } from 'reactstrap';
import { Link } from 'react-router-dom';

const Association = ({ imgSrc, title, description, to }) => (
  <Media className="align-items-center mb-2">
    <img className="mr-2" src={imgSrc} width={50} alt="" />
    <Media body>
      <h6 className="fs-0 mb-0">
        <Link className="stretched-link" to={to}>
          {title}
        </Link>
      </h6>
      <p className="mb-0">{description}</p>
    </Media>
  </Media>
);

Association.propTypes = {
  imgSrc: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  to: PropTypes.string.isRequired
};

export default Association;
