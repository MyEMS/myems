import React, { Fragment, useContext, useState } from 'react';
import PropTypes from 'prop-types';
import AppContext, { ProductContext } from '../../context/Context';
import { Card, CardBody, Col, Media, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import { calculateSale, isIterableArray } from '../../helpers/utils';
import FalconCardHeader from '../common/FalconCardHeader';
import ButtonIcon from '../common/ButtonIcon';

const FavouriteItem = ({ id }) => {
  const { currency } = useContext(AppContext);
  const { products, handleCartAction, favouriteItemsDispatch } = useContext(ProductContext);
  const [cartLoading, setCartLoading] = useState(false);

  const handleAddToCart = () => {
    setCartLoading(true);
    setTimeout(() => {
      handleCartAction({ id });
      setCartLoading(false);
    }, 1000);
  };

  const { title, files, price, sale } = products.find(product => product.id === id);

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
              onClick={() => favouriteItemsDispatch({ type: 'REMOVE', id })}
            >
              Remove
            </div>
          </Media>
        </Media>
      </Col>
      <Col xs={4} className="p-3">
        <Row className="align-items-center">
          <Col md={4} className="d-flex justify-content-end justify-content-md-center px-2 px-md-3 order-1 order-md-0">
            {currency}
            {calculateSale(price, sale)}
          </Col>
          <Col md={8} className="text-right pl-0 pr-2 pr-md-3 order-0 order-md-1 mb-2 mb-md-0 text-600">
            {cartLoading ? (
              <ButtonIcon
                color="outline-primary"
                size="sm"
                icon="circle-notch"
                iconClassName="fa-spin ml-2 d-none d-md-inline-block"
                style={{ cursor: 'progress' }}
                disabled
              >
                Processing
              </ButtonIcon>
            ) : (
              <ButtonIcon
                color="outline-primary"
                size="sm"
                icon="cart-plus"
                iconClassName="ml-2 d-none d-md-inline-block"
                onClick={handleAddToCart}
              >
                Add to Cart
              </ButtonIcon>
            )}
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

FavouriteItem.propTypes = { id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired };

const FavouriteItems = () => {
  const { favouriteItems } = useContext(ProductContext);

  return (
    <Card>
      <FalconCardHeader
        title={`Favourites (${favouriteItems.length} Item${favouriteItems.length === 1 ? '' : 's'})`}
        light={false}
      >
        <ButtonIcon
          icon="chevron-left"
          color="primary"
          size="sm"
          className="border-300"
          tag={Link}
          to="/e-commerce/products/list"
        >
          Continue Shopping
        </ButtonIcon>
      </FalconCardHeader>
      <CardBody className="p-0">
        {isIterableArray(favouriteItems) ? (
          <Fragment>
            <Row noGutters className="bg-200 text-900 px-1 fs--1 font-weight-semi-bold">
              <Col xs={9} md={8} className="p-2 px-md-3">
                Name
              </Col>
              <Col xs={3} md={4} className="px-3">
                <Row>
                  <Col md={4} className="py-2 d-none d-md-block text-center">
                    Price
                  </Col>
                  <Col md={8} className="text-right p-2 px-md-3">
                    Cart
                  </Col>
                </Row>
              </Col>
            </Row>
            {favouriteItems.map(favouriteItem => (
              <FavouriteItem {...favouriteItem} key={favouriteItem.id} />
            ))}
          </Fragment>
        ) : (
          <p className="p-card mb-0 bg-light">0 items in your Favourite list. Go ahead and add something!</p>
        )}
      </CardBody>
    </Card>
  );
};

export default FavouriteItems;
