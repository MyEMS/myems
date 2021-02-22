import React from 'react';
import PropTypes from 'prop-types';
import { Media } from 'reactstrap';
import Lightbox from 'react-image-lightbox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const getIconClassNames = type => {
  switch (type) {
    case 'youtube':
      return 'text-youtube';
    case 'zip':
      return 'text-warning';
    case 'doc':
      return 'text-primary';
    case 'img':
      return 'text-danger';
    case 'pdf':
      return 'text-danger';
    default:
      return 'text-primary';
  }
};

const EmailAttachment = ({ fileName, icon, type, src }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Media
      className="d-inline-flex align-items-center border rounded-pill px-3 py-1 mr-2 mt-2 inbox-link cursor-pointer"
      onClick={() => setIsOpen(!isOpen)}
    >
      {type === 'img' && isOpen && (
        <Lightbox
          mainSrc={src}
          reactModalStyle={{ overlay: { zIndex: 999999 } }}
          onCloseRequest={() => setIsOpen(!isOpen)}
        />
      )}
      <FontAwesomeIcon icon={icon} transform="grow-4" className={getIconClassNames(type)} />
      <span className="ml-2">{fileName}</span>
    </Media>
  );
};

EmailAttachment.propTypes = {
  fileName: PropTypes.string.isRequired,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  type: PropTypes.string.isRequired,
  src: PropTypes.string
};

export default EmailAttachment;
