import React from 'react';
import PropTypes from 'prop-types';

const FeedUrl = ({ imgUrl, urlAddress, title, description }) => (
  <a className="text-decoration-none" href="#!">
    {!!imgUrl && <img className="img-fluid rounded" src={imgUrl} alt="" />}
    <small className="text-uppercase text-700">{urlAddress}</small>
    <h6 className="fs-0 mb-0">{title}</h6>
    {!!description && <p className="fs--1 mb-0 text-700">{description}</p>}
  </a>
);

FeedUrl.propTypes = {
  urlAddress: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  imgUrl: PropTypes.string
};
export default FeedUrl;
