import React from 'react';
import PropTypes from 'prop-types';
import { cssTransition } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const Fade = cssTransition({ enter: 'fadeIn', exit: 'fadeOut' });

export const CloseButton = ({ closeToast }) => (
  <FontAwesomeIcon icon="times" className="my-2 fs--2" style={{ opacity: 0.5 }} onClick={closeToast} />
);

CloseButton.propTypes = { closeToast: PropTypes.func };
