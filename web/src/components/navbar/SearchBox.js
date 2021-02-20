import React from 'react';
import { Form, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const SearchBox = () => (
  <Form inline className="search-box">
    <Input type="search" placeholder="Search..." aria-label="Search" className="rounded-pill search-input" />
    <FontAwesomeIcon icon="search" className="position-absolute text-400 search-box-icon" />
  </Form>
);

export default SearchBox;
