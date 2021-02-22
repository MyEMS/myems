import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, CardBody, CustomInput, Input, Table } from 'reactstrap';
import useFakeFetch from '../../hooks/useFakeFetch';
import Loader from '../common/Loader';
import ButtonIcon from '../common/ButtonIcon';
import FalconCardHeader from '../common/FalconCardHeader';
import { isIterableArray } from '../../helpers/utils';
import rawEventTickets from '../../data/event/eventTickets';

const TicketRow = ({ id, name, price, checked = false, handleChange, handleRemove }) => (
  <tr>
    <td>
      <Input
        bsSize="sm"
        placeholder="Option Name"
        value={name}
        onChange={({ target }) => handleChange(id, 'name', target.value)}
      />
    </td>
    <td>
      <Input
        bsSize="sm"
        placeholder="Price"
        value={price}
        onChange={({ target }) => handleChange(id, 'price', target.value)}
      />
    </td>
    <td className="text-center align-middle">
      <CustomInput
        type="radio"
        id={`ticketPrice${id}`}
        name="ticketPriceRadio"
        checked={checked}
        onChange={({ target }) => handleChange(id, 'checked', target.checked)}
      />
    </td>
    <td className="text-center align-middle">
      <Button color="link" size="sm" onClick={() => handleRemove(id)}>
        <FontAwesomeIcon icon="times-circle" className="text-danger" transform="shrink-3" />
      </Button>
    </td>
  </tr>
);

TicketRow.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  handleRemove: PropTypes.func.isRequired,
  checked: PropTypes.bool
};

const EventTicket = () => {
  // Data
  const { loading: loadingTickets, data: tickets, setData: setTickets } = useFakeFetch(rawEventTickets);

  // Change Ticket
  const changeTicket = (id, name, value) => {
    const updatedTickets = name === 'checked' ? tickets.map(ticket => ({ ...ticket, checked: false })) : [...tickets];
    const updatedTicket = { ...tickets[id], [name]: value };

    setTickets([...updatedTickets.slice(0, id), updatedTicket, ...updatedTickets.slice(id + 1)]);
  };

  // Remove Ticket
  const removeTicket = id => setTickets([...tickets.slice(0, id), ...tickets.slice(id + 1)]);

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Ticket Price" light={false} />
      <CardBody className="bg-light">
        <div className="mb-3">
          <Button color="falcon-default" size="sm">
            Free
            <span className="d-none d-sm-inline"> Ticket</span>
          </Button>
          <Button color="falcon-primary" size="sm" className="ml-2">
            Paid
            <span className="d-none d-sm-inline"> Ticket</span>
          </Button>
          <Button color="falcon-default" size="sm" className="ml-2">
            Donation
          </Button>
        </div>
        <hr />
        <h6>Pricing Options:</h6>
        <CustomInput type="checkbox" id="variablePricingCheckbox" label="Enable variable pricing" />
        <CustomInput type="checkbox" id="multiOptionPurchaseCheckbox" label="Enable multi-option purchase mode." />
        <Table bordered className="mt-2 bg-white">
          <thead>
            <tr className="fs--1">
              <th>Option Name</th>
              <th>Price ($)</th>
              <th>Default</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {loadingTickets ? (
              <tr>
                <td>
                  <Loader />
                </td>
              </tr>
            ) : (
              isIterableArray(tickets) &&
              tickets.map((ticketPrice, index) => (
                <TicketRow
                  {...ticketPrice}
                  id={index}
                  handleChange={changeTicket}
                  handleRemove={removeTicket}
                  key={index}
                />
              ))
            )}
          </tbody>
        </Table>
        <ButtonIcon
          color="falcon-default"
          size="sm"
          icon="plus"
          onClick={() => setTickets([...tickets, { name: '', price: '' }])}
        >
          Add New
        </ButtonIcon>
      </CardBody>
    </Card>
  );
};

export default EventTicket;
