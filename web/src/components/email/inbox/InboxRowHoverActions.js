import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup } from 'reactstrap';
import InboxActionButton from './InboxActionButton';
import { EmailContext } from '../../../context/Context';

const EmailRowHoverActions = ({ id, read, snooze }) => {
  const { handleAction } = useContext(EmailContext);

  return (
    <ButtonGroup size="sm" className="hover-actions r-0 mr-3">
      <InboxActionButton color="light" id={`archive${id}`} icon="archive" onClick={() => handleAction('archive', [id])}>
        Archive
      </InboxActionButton>
      <InboxActionButton color="light" id={`delete${id}`} icon="trash-alt" onClick={() => handleAction('delete', [id])}>
        Delete
      </InboxActionButton>
      <InboxActionButton
        color="light"
        id={`read${id}`}
        icon={read ? 'envelope' : 'envelope-open'}
        onClick={() => handleAction('read', [id])}
      >
        Mark as {read ? 'unread' : 'read'}
      </InboxActionButton>
      <InboxActionButton
        color="light"
        id={`snooze${id}`}
        icon={snooze ? ['far', 'clock'] : 'clock'}
        onClick={() => handleAction('snooze', [id])}
      >
        {snooze ? 'Snoozed' : 'Snooze'}
      </InboxActionButton>
    </ButtonGroup>
  );
};

EmailRowHoverActions.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  read: PropTypes.bool.isRequired
};

export default EmailRowHoverActions;
