import React from 'react';
import PropTypes from 'prop-types';
import { Button, Input, InputGroup, InputGroupAddon } from 'reactstrap';

const QuantityController = ({ quantity, setQuantity }) => (
  <InputGroup size="sm">
    <InputGroupAddon addonType="prepend">
      <Button
        color="outline-secondary"
        size="sm"
        className="border-300 px-2"
        onClick={() => setQuantity(quantity > 1 ? quantity - 1 : quantity)}
      >
        -
      </Button>
    </InputGroupAddon>
    <Input
      className="text-center px-2 input-spin-none"
      value={quantity}
      onChange={({ target }) => setQuantity(parseInt(target.value < 1 ? 1 : target.value))}
      type="number"
      min={1}
      style={{ maxWidth: '40px' }}
    />
    <InputGroupAddon addonType="append">
      <Button color="outline-secondary" size="sm" className="border-300 px-2" onClick={() => setQuantity(quantity + 1)}>
        +
      </Button>
    </InputGroupAddon>
  </InputGroup>
);

QuantityController.propTypes = {
  setQuantity: PropTypes.func.isRequired,
  quantity: PropTypes.number
};

QuantityController.defaultProps = { quantity: 1 };

export default QuantityController;
