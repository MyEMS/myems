import React from 'react';
import PropTypes from 'prop-types';
import PageHeader from '../common/PageHeader';
import { Badge } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const OrderDetailsHeader = props => {
  return (
    <PageHeader title="Order Details: #2737" titleTag="h5" {...props}>
      <p className="fs--1 mt-1">April 21, 2019, 5:33 PM</p>
      <div>
        <strong className="mr-2">Status: </strong>
        <Badge color="soft-success" pill className="fs--2">
          Completed
          <FontAwesomeIcon icon="check" transform="shrink-2" className=" ml-1" />
        </Badge>
      </div>
    </PageHeader>
  );
};
OrderDetailsHeader.propTypes = {
  className: PropTypes.string
};
OrderDetailsHeader.defaultProps = {
  className: 'mb-3'
};
export default OrderDetailsHeader;
