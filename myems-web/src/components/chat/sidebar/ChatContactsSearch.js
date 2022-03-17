import React from 'react';
import { Form, FormGroup, Input, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ChatContactsSearch = () => (
  <Form className="contacts-search-wrapper" onSubmit={e => e.preventDefault()}>
    <FormGroup className="mb-0 position-relative d-md-none d-lg-block w-100 h-100">
      <Input className="chat-contacts-search border-0 h-100" placeholder="Search contacts ..." bsSize="sm" />
      <FontAwesomeIcon icon="search" className="contacts-search-icon" />
    </FormGroup>
    <Button color="transparent" size="sm" className="d-none d-md-inline-block d-lg-none" type="submit">
      <FontAwesomeIcon icon="search" className="fs--1" />
    </Button>
  </Form>
);

export default ChatContactsSearch;
