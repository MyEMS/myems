import React from 'react';
import PropTypes from 'prop-types';
import { Media } from 'reactstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const HighlightMedia = ({ src, icon, to, children }) => {
  return (
    <Media tag={Link} className="align-items-center mb-2" to={to}>
      {src ? (
        <img className="mr-2" src={src} alt="" width="30" />
      ) : (
        <FontAwesomeIcon icon={icon} className="fs-4 mr-2 text-700" />
      )}
      <Media body>{children}</Media>
    </Media>
  );
};

HighlightMedia.propTypes = {
  src: PropTypes.string,
  icon: PropTypes.string,
  to: PropTypes.string,
  children: PropTypes.node
};

HighlightMedia.defaultProps = { icon: 'profile-circle', to: '#!' };

export default HighlightMedia;
