import React, { Component } from 'react';
import { EmailContext } from '../../../context/Context';
import rawEmails from '../../../data/email/emails';
import { isIterableArray } from '../../../helpers/utils';

class InboxProvider extends Component {
  setEmails = emails => this.setState({ emails });
  setCurrentFilter = currentFilter => this.setState({ currentFilter });

  // Handlers
  handleAction = (action, selectedIds) => {
    const { emails, setEmails } = this.state;

    setEmails(
      action === 'delete' || action === 'archive'
        ? emails.filter(({ id }) => !selectedIds.includes(id))
        : emails.map(email => (selectedIds.includes(email.id) ? { ...email, [action]: !email[action] } : email))
    );
  };

  handleFilter = filter => {
    const { setEmails, setCurrentFilter } = this.state;
    setCurrentFilter(filter);

    switch (filter) {
      case 'all':
        return setEmails(rawEmails);
      case 'unread':
        return setEmails(rawEmails.filter(email => !email.read));
      case 'attachments':
        return setEmails(rawEmails.filter(email => isIterableArray(email.attachments)));
      default:
        return setEmails(rawEmails.filter(email => email[filter]));
    }
  };

  state = {
    emails: [],
    setEmails: this.setEmails,
    filters: ['all', 'unread', 'star', 'attachments', 'archive', 'snooze'],
    currentFilter: 'all',
    setCurrentFilter: this.setCurrentFilter,
    handleFilter: this.handleFilter,
    handleAction: this.handleAction
  };

  render() {
    return <EmailContext.Provider value={this.state}>{this.props.children}</EmailContext.Provider>;
  }
}

export default InboxProvider;
