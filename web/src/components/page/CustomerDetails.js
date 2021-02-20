import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Badge,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Media,
  Row,
  UncontrolledDropdown
} from 'reactstrap';
import Loader from '../common/Loader';
import ButtonIcon from '../common/ButtonIcon';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconCardFooterLink from '../common/FalconCardFooterLink';
import useFakeFetch from '../../hooks/useFakeFetch';
import { isIterableArray } from '../../helpers/utils';
import createMarkup from '../../helpers/createMarkup';
import rawCustomer from '../../data/customer/customer';
import rawCustomerLogs from '../../data/customer/customerLogs';

const CustomerSummary = () => {
  const { loading, data: customer } = useFakeFetch(rawCustomer);
  const { name, email, createdAt } = customer;

  return (
    <Card className="mb-3">
      {loading ? (
        <Loader />
      ) : (
        <Fragment>
          <CardHeader>
            <Row>
              <Col>
                <h5 className="mb-2">
                  {name} (<a href={`mailto:${email}`}>{email}</a>)
                </h5>
                <ButtonIcon color="falcon-default" size="sm" icon="plus" iconClassName="fs--2">
                  Add note
                </ButtonIcon>

                <UncontrolledDropdown className="d-inline-block ml-2">
                  <DropdownToggle color="falcon-default" size="sm">
                    <FontAwesomeIcon icon="ellipsis-h" />
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem>Edit</DropdownItem>
                    <DropdownItem>Report</DropdownItem>
                    <DropdownItem>Archive</DropdownItem>
                    <DropdownItem divider />
                    <DropdownItem className="text-danger">Delete user</DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </Col>
              <Col xs="auto" className="d-none d-sm-block">
                <h6 className="text-uppercase text-600">
                  Customer
                  <FontAwesomeIcon icon="user" className="ml-2" />
                </h6>
              </Col>
            </Row>
          </CardHeader>
          <CardBody className="border-top">
            <Media>
              <FontAwesomeIcon icon="user" transform="down-5" className="text-success mr-2" />
              <Media body>
                <p className="mb-0">Customer was created</p>
                <p className="fs--1 mb-0 text-600">{createdAt}</p>
              </Media>
            </Media>
          </CardBody>
        </Fragment>
      )}
    </Card>
  );
};

const CustomerDetailRow = ({ title, isLastItem, children }) => (
  <Row>
    <Col xs={5} sm={4}>
      <p
        className={classNames('font-weight-semi-bold', {
          'mb-0': isLastItem,
          'mb-1': !isLastItem
        })}
      >
        {title}
      </p>
    </Col>
    <Col>{children}</Col>
  </Row>
);

CustomerDetailRow.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  isLastItem: PropTypes.bool
};

CustomerDetailRow.defaultProps = { last: false };

const CustomerDetail = () => {
  const { loading, data: customer } = useFakeFetch(rawCustomer);
  const { id, email, createdAt, description, vat_no, email_to, address, cell, invoice_prefix } = customer;

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Details">
        <ButtonIcon tag={Link} color="falcon-default" size="sm" icon="pencil-alt" to="#!" iconClassName="fs--2">
          Update details
        </ButtonIcon>
      </FalconCardHeader>
      <CardBody className="bg-light border-top">
        {loading ? (
          <Loader />
        ) : (
          <Row>
            <Col lg className="col-xxl-5">
              <h6 className="font-weight-semi-bold ls mb-3 text-uppercase">Account Information</h6>
              <CustomerDetailRow title="ID">{id}</CustomerDetailRow>
              <CustomerDetailRow title="Created">{createdAt}</CustomerDetailRow>
              <CustomerDetailRow title="Email">
                <a href={`mailto:${email}`}>{email}</a>
              </CustomerDetailRow>
              <CustomerDetailRow title="Description">
                {description ? description : <p className="font-italic text-400 mb-1">No Description</p>}
              </CustomerDetailRow>
              <CustomerDetailRow title="VAT number" isLastItem>
                {vat_no ? vat_no : <p className="font-italic text-400 mb-0">No VAT Number</p>}
              </CustomerDetailRow>
            </Col>
            <Col lg className="col-xxl-5 mt-4 mt-lg-0 offset-xxl-1">
              <h6 className="font-weight-semi-bold ls mb-3 text-uppercase">Billing Information</h6>
              <CustomerDetailRow title="Send email to">
                <a href={`mailto:${email_to}`}>{email_to}</a>
              </CustomerDetailRow>
              <CustomerDetailRow title="Address">
                <p className="mb-1" dangerouslySetInnerHTML={createMarkup(address)} />
              </CustomerDetailRow>
              <CustomerDetailRow title="Phone number">
                <a href={`tel:${cell}`}>{cell}</a>
              </CustomerDetailRow>
              <CustomerDetailRow title="Invoice prefix" isLastItem>
                <p className="font-weight-semi-bold mb-0">{invoice_prefix}</p>
              </CustomerDetailRow>
            </Col>
          </Row>
        )}
      </CardBody>
      <CardFooter className="border-top text-right">
        <ButtonIcon tag={Link} color="falcon-default" size="sm" icon="dollar-sign" to="#!" iconClassName="fs--2">
          Refund
        </ButtonIcon>
        <ButtonIcon
          tag={Link}
          color="falcon-default"
          size="sm"
          icon="check"
          className="ml-2"
          to="#!"
          iconClassName="fs--2"
        >
          Save changes
        </ButtonIcon>
      </CardFooter>
    </Card>
  );
};

const CustomerLog = ({ status, link, time }) => {
  let badgeColor = 'soft-warning';
  if (status === 404) badgeColor = 'soft-danger';
  else if (status === 200) badgeColor = 'soft-success';

  return (
    <Row noGutters className="align-items-center border-bottom py-2 px-3">
      <Col md="auto" className="pr-3">
        <Badge color={badgeColor} pill>
          {status}
        </Badge>
      </Col>
      <Col md className="mt-1 mt-md-0">
        <code>POST {link}</code>
      </Col>
      <Col md="auto">
        <p className="mb-0">{time}</p>
      </Col>
    </Row>
  );
};

CustomerLog.propTypes = {
  status: PropTypes.number.isRequired,
  link: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired
};

const CustomerLogs = () => {
  const { loading, data: customerLogs } = useFakeFetch(rawCustomerLogs);

  return (
    <Card>
      <FalconCardHeader title="Logs" />
      <CardBody className="border-top p-0">
        {loading ? (
          <Loader />
        ) : (
          isIterableArray(customerLogs) && customerLogs.map((log, index) => <CustomerLog {...log} key={index} />)
        )}
      </CardBody>
      <FalconCardFooterLink title="View more logs" to="#!" borderTop={false} />
    </Card>
  );
};

const CustomerDetails = () => (
  <Fragment>
    <CustomerSummary />
    <CustomerDetail />
    <CustomerLogs />
  </Fragment>
);

export default CustomerDetails;
