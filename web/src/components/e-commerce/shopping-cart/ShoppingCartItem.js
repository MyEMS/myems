import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import AppContext, { ProductContext } from '../../../context/Context';
import { Col, Media, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import QuantityController from '../../common/QuantityController';
import { calculateSale } from '../../../helpers/utils';

const ShoppingCartItem = ({ id }) => {
  const { currency } = useContext(AppContext);
  const { products, shoppingCart, shoppingCartDispatch, handleCartAction } = useContext(ProductContext);
  const [quantity, setQuantity] = useState(shoppingCart.find(shoppingCartItem => shoppingCartItem.id === id).quantity);

  const { title, files, price, sale } = products.find(product => product.id === id);

  useEffect(() => {
    shoppingCartDispatch({ type: 'EDIT', id, payload: { id, quantity } });
  }, [quantity, shoppingCartDispatch, id]);

  return (
    <Row noGutters className="align-items-center px-1 border-bottom border-200">
      <Col xs={8} className="py-3 px-2 px-md-3">
        <Media className="align-items-center">
          <Link to={`/e-commerce/product-details/${id}`}>
            <img
              className="rounded mr-3 d-none d-md-block"
              src={files[0]['src'] || files[0]['base64']}
              alt=""
              width="60"
            />
          </Link>
          <Media body>
            <h5 className="fs-0">
              <Link className="text-900" to={`/e-commerce/product-details/${id}`}>
                {title}
              </Link>
            </h5>
            <div
              className="fs--2 fs-md--1 text-danger cursor-pointer"
              onClick={() => handleCartAction({ id, quantity, type: 'REMOVE' })}
            >
              Remove
            </div>
          </Media>
        </Media>
      </Col>
      <Col xs={4} className="p-3">
        <Row className="align-items-center">
          <Col md={8} className="d-flex justify-content-end justify-content-md-center px-2 px-md-3 order-1 order-md-0">
            <div>
              <QuantityController quantity={quantity} setQuantity={setQuantity} />
            </div>
          </Col>
          <Col md={4} className="text-right pl-0 pr-2 pr-md-3 order-0 order-md-1 mb-2 mb-md-0 text-600">
            {currency}
            {calculateSale(price, sale) * quantity}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

ShoppingCartItem.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  quantity: PropTypes.number.isRequired
};

export default ShoppingCartItem;
