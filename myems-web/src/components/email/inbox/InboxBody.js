import React, { Fragment, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import Loader from '../../common/Loader';
import { isIterableArray } from '../../../helpers/utils';
import EmailRow from './InboxRow';
import { Alert, CardBody } from 'reactstrap';
import classNames from 'classnames';
import { EmailContext } from '../../../context/Context';
import useFakeFetch from '../../../hooks/useFakeFetch';
import rawEmails from '../../../data/email/emails';

const InboxTitle = ({ className, children, ...rest }) => (
  <h5 className={classNames('fs-0 px-3 pt-3 pb-2 mb-0 border-bottom border-200', className)} {...rest}>
    {children}
  </h5>
);

InboxTitle.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

const InboxBody = ({ isSelectedItem, toggleSelectedItem, currentItems }) => {
  // Context
  const { emails, setEmails } = useContext(EmailContext);

  // State
  const { loading, data } = useFakeFetch(rawEmails);
  const unreadEmails = emails.filter(email => !email.read && currentItems.includes(email.id));
  const otherEmails = emails.filter(email => email.read && currentItems.includes(email.id));

  useEffect(() => {
    setEmails(data);
  }, [data, setEmails]);

  return (
    <CardBody className="fs--1 border-top border-200 p-0">
      {loading ? (
        <Loader type="border" />
      ) : isIterableArray(emails) ? (
        <Fragment>
          {isIterableArray(unreadEmails) && (
            <Fragment>
              <InboxTitle>Unread</InboxTitle>
              {unreadEmails.map(email => (
                <EmailRow
                  {...email}
                  key={email.id}
                  toggleSelectedItem={toggleSelectedItem}
                  isSelectedItem={isSelectedItem}
                />
              ))}
            </Fragment>
          )}

          {isIterableArray(otherEmails) && (
            <Fragment>
              <InboxTitle>Everything else</InboxTitle>
              {otherEmails.map(email => (
                <EmailRow
                  {...email}
                  key={email.id}
                  toggleSelectedItem={toggleSelectedItem}
                  isSelectedItem={isSelectedItem}
                />
              ))}
            </Fragment>
          )}
        </Fragment>
      ) : (
        <Alert color="info" className="mb-0 rounded-0">
          <h5 className="alert-heading">Inbox empty!</h5>
          <hr />
          <p className="mb-0">Emails will be shown here automatically.</p>
        </Alert>
      )}
    </CardBody>
  );
};

InboxBody.propTypes = {
  isSelectedItem: PropTypes.func.isRequired,
  toggleSelectedItem: PropTypes.func.isRequired,
  currentItems: PropTypes.array.isRequired
};

export default InboxBody;
