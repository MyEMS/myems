import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import InboxActionButton from './InboxActionButton';
import { EmailContext } from '../../../context/Context';

const InboxBulkActions = ({ selectedItems }) => {
  const { handleAction } = useContext(EmailContext);

  return (
    <div className="ml-sm-1">
      <InboxActionButton
        color="falcon-default"
        size="sm"
        icon="archive"
        id="archiveBulk"
        onClick={() => handleAction('archive', selectedItems)}
      >
        Archive
      </InboxActionButton>
      <InboxActionButton
        color="falcon-default"
        size="sm"
        className="ml-2"
        icon="trash-alt"
        id="deleteBulk"
        onClick={() => handleAction('delete', selectedItems)}
      >
        Delete
      </InboxActionButton>
      <InboxActionButton
        color="falcon-default"
        size="sm"
        className="ml-2"
        icon="envelope"
        id="readBulk"
        onClick={() => handleAction('read', selectedItems)}
      >
        Mark as read
      </InboxActionButton>
      <InboxActionButton
        color="falcon-default"
        size="sm"
        className="ml-2"
        icon="clock"
        id="snoozeBulk"
        onClick={() => handleAction('snooze', selectedItems)}
      >
        Snooze
      </InboxActionButton>
    </div>
  );
};

InboxBulkActions.propTypes = { selectedItems: PropTypes.array.isRequired };

export default InboxBulkActions;
