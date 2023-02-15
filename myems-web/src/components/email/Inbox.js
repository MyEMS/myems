import React, { Fragment } from 'react';
import { Card } from 'reactstrap';
import InboxHeader from './inbox/InboxHeader';
import InboxBody from './inbox/InboxBody';
import InboxFooter from './inbox/InboxFooter';
import useBulkSelect from '../../hooks/useBulkSelect';
import usePagination from '../../hooks/usePagination';
import rawEmails from '../../data/email/emails';

const emailIds = rawEmails.map(email => email.id);

const Inbox = () => {
  // Hook
  const { data: paginationData, meta: paginationMeta, handler: paginationHandler } = usePagination(emailIds, 10);
  const {
    selectedItems,
    isSelectedItem,
    isAllSelected,
    isIndeterminate,
    toggleSelectedItem,
    toggleIsAllSelected
  } = useBulkSelect(emailIds);

  return (
    <Fragment>
      <Card>
        <InboxHeader
          isAllSelected={isAllSelected}
          isIndeterminate={isIndeterminate}
          toggleIsAllSelected={toggleIsAllSelected}
          selectedItems={selectedItems}
        />
        <InboxBody
          isSelectedItem={isSelectedItem}
          toggleSelectedItem={toggleSelectedItem}
          currentItems={paginationData}
        />
        <InboxFooter meta={paginationMeta} handler={paginationHandler} />
      </Card>
    </Fragment>
  );
};

export default Inbox;
