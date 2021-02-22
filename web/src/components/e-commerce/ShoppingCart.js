import React, { useContext } from 'react';
import { ProductContext } from '../../context/Context';
import FalconCardHeader from '../common/FalconCardHeader';
import { Button, Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import ButtonIcon from '../common/ButtonIcon';
import ShoppingCartFooter from './shopping-cart/ShoppingCartFooter';
import ShoppingCartTable from './shopping-cart/ShoppingCartTable';
import { isIterableArray } from '../../helpers/utils';
import classNames from 'classnames';

const ShoppingCart = () => {
  const { shoppingCart } = useContext(ProductContext);

  return (
    <Card>
      <FalconCardHeader title={`Shopping Cart (${shoppingCart.length} Items)`} light={false} breakPoint="sm">
        <ButtonIcon
          icon="chevron-left"
          color={classNames({
            'outline-secondary': isIterableArray(shoppingCart),
            primary: !isIterableArray(shoppingCart)
          })}
          size="sm"
          className={classNames({ 'border-300': !isIterableArray(shoppingCart) })}
          tag={Link}
          to="/e-commerce/products/list"
        >
          Continue Shopping
        </ButtonIcon>
        {isIterableArray(shoppingCart) && (
          <Button tag={Link} color="primary" size="sm" to="/e-commerce/checkout" className="ml-2">
            Checkout
          </Button>
        )}
      </FalconCardHeader>
      <CardBody className="p-0">
        <ShoppingCartTable />
      </CardBody>
      {isIterableArray(shoppingCart) && <ShoppingCartFooter />}
    </Card>
  );
};

export default ShoppingCart;
