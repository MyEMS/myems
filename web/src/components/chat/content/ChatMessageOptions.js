import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UncontrolledTooltip } from 'reactstrap';
import uuid from 'uuid/v1';
import PropTypes from 'prop-types';

const ChatMessageOptions = ({ id = uuid() }) => (
  <ul className="hover-actions position-relative list-inline mb-0 text-400 mx-2">
    <li className="list-inline-item cursor-pointer chat-option-hover" id={`share-${id}`}>
      <FontAwesomeIcon icon="share" />
      <UncontrolledTooltip placement="top" target={`share-${id}`}>
        Forward
      </UncontrolledTooltip>
    </li>
    <li className="list-inline-item cursor-pointer chat-option-hover" id={`archive-${id}`}>
      <FontAwesomeIcon icon="archive" />
      <UncontrolledTooltip placement="top" target={`archive-${id}`}>
        Archive
      </UncontrolledTooltip>
    </li>
    <li className="list-inline-item cursor-pointer chat-option-hover" id={`edit-${id}`}>
      <FontAwesomeIcon icon="edit" />
      <UncontrolledTooltip placement="top" target={`edit-${id}`}>
        Edit
      </UncontrolledTooltip>
    </li>
    <li className="list-inline-item cursor-pointer chat-option-hover" id={`delete-${id}`}>
      <FontAwesomeIcon icon="trash-alt" />
      <UncontrolledTooltip placement="top" target={`delete-${id}`}>
        Remove
      </UncontrolledTooltip>
    </li>
  </ul>
);

ChatMessageOptions.propTypes = {
  id: PropTypes.string
};

export default ChatMessageOptions;
