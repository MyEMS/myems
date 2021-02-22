import React, { Fragment, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'reactstrap';
import StarCount from '../product/StarCount';
import classNames from 'classnames';
import { calculateSale, isIterableArray } from '../../../helpers/utils';
import QuantityController from '../../common/QuantityController';
import ButtonIcon from '../../common/ButtonIcon';
import AppContext, { ProductContext } from '../../../context/Context';

const ProductDetailsMain = ({
  id,
  title,
  category,
  features,
  price,
  sale,
  rating,
  review,
  shippingCost,
  isInStock
}) => {
  const { currency } = useContext(AppContext);
  const { isInFavouriteItems, favouriteItemsDispatch, handleCartAction } = useContext(ProductContext);
  const [quantity, setQuantity] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);

  const handleAddToCart = () => {
    setCartLoading(true);
    setTimeout(() => {
      handleCartAction({ id, quantity });
      setCartLoading(false);
      setQuantity(1);
    }, 1000);
  };

  return (
    <Fragment>
      <div>
        <h5>{title}</h5>
        <a className="fs--1 mb-2 d-block" href="#!">
          {category}
        </a>
        <span className="fs--2 mb-3 d-inline-block">
          <StarCount stars={rating} />
          <span className="ml-1 text-600">({review})</span>
        </span>
        {isIterableArray(features) && (
          <ul className="fs--1 pl-3">
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        )}
        {/*<p className="fs--1">{features}</p>*/}
        <h4 className="d-flex align-items-center">
          <span className="text-warning mr-2">
            {currency}
            {calculateSale(price, sale)}
          </span>
          {!!sale && (
            <span className="mr-1 fs--1 text-500">
              <del className="mr-1">
                {currency}
                {price}
              </del>
              <strong>-{sale}%</strong>
            </span>
          )}
        </h4>
        <p className="fs--1 mb-1">
          <span>Shipping Cost: </span>
          <strong>
            {currency}
            {shippingCost}
          </strong>
        </p>
        <p className="fs--1">
          Stock:{' '}
          <strong className={classNames({ 'text-success': isInStock, 'text-danger': !isInStock })}>
            {isInStock ? 'Available' : 'Sold-Out'}
          </strong>
        </p>
      </div>
      <Row>
        <Col xs={12}>
          <p className="fs--1 mb-3">
            Tags:{' '}
            <a className="ml-2" href="#!">
              Computer,
            </a>
            <a className="ml-1" href="#!">
              Mac Book,
            </a>
            <a className="ml-1" href="#!">
              Mac Book Pro,
            </a>
            <a className="ml-1" href="#!">
              Laptop
            </a>
          </p>
        </Col>
        <Col xs="auto" className="pr-0">
          <QuantityController quantity={quantity} setQuantity={setQuantity} />
        </Col>
        <div className="col-auto">
          {cartLoading ? (
            <ButtonIcon
              color="primary"
              size="sm"
              icon="circle-notch"
              iconClassName="fa-spin"
              style={{ cursor: 'progress' }}
              disabled
            >
              Processing
            </ButtonIcon>
          ) : (
            <ButtonIcon color="primary" size="sm" icon="cart-plus" onClick={handleAddToCart}>
              Add to Cart
            </ButtonIcon>
          )}
        </div>
        <div className="col-sm-auto pl-3 pl-sm-0">
          <ButtonIcon
            color="outline-danger"
            size="sm"
            className="border-300 mr-2 mt-2 mt-sm-0"
            icon={[isInFavouriteItems(id) ? 'fas' : 'far', 'heart']}
            onClick={() =>
              isInFavouriteItems(id)
                ? favouriteItemsDispatch({ type: 'REMOVE', id })
                : favouriteItemsDispatch({ type: 'ADD', payload: { id } })
            }
          >
            282
          </ButtonIcon>
        </div>
      </Row>
    </Fragment>
  );
};

ProductDetailsMain.propTypes = { value: PropTypes.any };

ProductDetailsMain.defaultProps = { value: `ProductDetailsMain` };

export default ProductDetailsMain;
