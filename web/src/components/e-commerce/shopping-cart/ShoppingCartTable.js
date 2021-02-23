import React, { Fragment, useContext } from 'react';
import { calculateSale, getTotalPrice, isIterableArray } from '../../../helpers/utils';
import { Col, Row } from 'reactstrap';
import ShoppingCartItem from './ShoppingCartItem';
import AppContext, { ProductContext } from '../../../context/Context';

const ShoppingCartTable = () => {
  const { currency } = useContext(AppContext);
  const { products, shoppingCart, appliedPromo } = useContext(ProductContext);

  return (
    <Fragment>
      {isIterableArray(shoppingCart) ? (
        <Fragment>
          <Row noGutters className="bg-200 text-900 px-1 fs--1 font-weight-semi-bold">
            <Col xs={9} md={8} className="p-2 px-md-3">
              Name
            </Col>
            <Col xs={3} md={4} className="px-3">
              <Row>
                <Col md={8} className="py-2 d-none d-md-block text-center">
                  Quantity
                </Col>
                <Col md={4} className="text-right p-2 px-md-3">
                  Price
                </Col>
              </Row>
            </Col>
          </Row>
          {shoppingCart.map(shoppingCartItem => (
            <ShoppingCartItem {...shoppingCartItem} key={shoppingCartItem.id} />
          ))}
          <Row noGutters className="font-weight-bold px-1">
            <Col xs={9} md={8} className="py-2 px-md-3 text-right text-900">
              Total
            </Col>
            <Col className="px-3">
              <Row>
                <Col md={8} className="py-2 d-none d-md-block text-center">
                  {shoppingCart.length} (items)
                </Col>
                <Col className="col-12 col-md-4 text-right py-2 pr-md-3 pl-0">
                  {currency}
                  {calculateSale(getTotalPrice(shoppingCart, products), !!appliedPromo ? appliedPromo.discount : 0)}
                </Col>
              </Row>
            </Col>
          </Row>
        </Fragment>
      ) : (
        <p className="p-card mb-0 bg-light">You have no items in your shopping cart. Go ahead and start shopping!</p>
      )}
    </Fragment>
  );
};

export default ShoppingCartTable;
