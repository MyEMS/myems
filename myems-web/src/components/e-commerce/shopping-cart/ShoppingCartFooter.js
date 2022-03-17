import React, { useContext, useState } from 'react';
import Flex from '../../common/Flex';
import { Button, CardFooter, Form, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { Link } from 'react-router-dom';
import { ProductContext } from '../../../context/Context';

const ShoppingCartFooter = () => {
  const { applyPromoCode } = useContext(ProductContext);
  const [promoCode, setPromoCode] = useState('');

  return (
    <CardFooter tag={Flex} justify="end" className="bg-light">
      <Form
        className="mr-3"
        onSubmit={e => {
          e.preventDefault();
          applyPromoCode(promoCode);
        }}
      >
        <InputGroup size="sm">
          <Input placeholder="GET50" value={promoCode} onChange={({ target }) => setPromoCode(target.value)} />
          <InputGroupAddon addonType="append">
            <Button color="outline-secondary" size="sm" className="border-300" type="submit">
              Apply
            </Button>
          </InputGroupAddon>
        </InputGroup>
      </Form>
      <Button tag={Link} color="primary" size="sm" to="/e-commerce/checkout">
        Checkout
      </Button>
    </CardFooter>
  );
};

export default ShoppingCartFooter;
