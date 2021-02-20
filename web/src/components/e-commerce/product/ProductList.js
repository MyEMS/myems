import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Badge, Col, Row } from 'reactstrap';
import { Link } from 'react-router-dom';
import { isIterableArray } from '../../../helpers/utils';
import Slider from 'react-slick/lib';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from '../../common/Flex';
import StarCount from './StarCount';
import classNames from 'classnames';
import ButtonIcon from '../../common/ButtonIcon';
import AppContext, { ProductContext } from '../../../context/Context';

const ProductList = ({
  id,
  files,
  title,
  category,
  features,
  price,
  sale,
  rating,
  review,
  shippingCost,
  isInStock,
  isNew,
  sliderSettings,
  index
}) => {
  const { currency, isDark } = useContext(AppContext);
  const { handleCartAction, isInFavouriteItems, favouriteItemsDispatch } = useContext(ProductContext);
  const [cartLoading, setCartLoading] = useState(false);

  const handleAddToCart = () => {
    setCartLoading(true);
    setTimeout(() => {
      handleCartAction({ id });
      setCartLoading(false);
    }, 1000);
  };

  return (
    <Col xs={12} className={classNames('p-3', { 'bg-100': isDark && index % 2 !== 0 })}>
      <div className="p-1">
        <Row>
          <Col sm={5} md={4}>
            <div className="position-relative h-sm-100">
              {isIterableArray(files) && files.length === 1 && (
                <Link className="d-block h-100" to={`/e-commerce/product-details/${id}`}>
                  <img
                    className="img-fluid fit-cover w-sm-100 h-sm-100 rounded absolute-sm-centered"
                    src={files[0]['src'] || files[0]['base64']}
                    alt={files[0].path}
                  />
                </Link>
              )}
              {isIterableArray(files) && files.length > 1 && (
                <Slider {...sliderSettings}>
                  {files.map(file => (
                    <Link className="d-block h-100" to={`/e-commerce/product-details/${id}`} key={file.id}>
                      <img
                        className="img-fluid fit-cover w-sm-100 h-sm-100 rounded"
                        src={file['src'] || file['base64']}
                        alt={file.path}
                      />
                    </Link>
                  ))}
                </Slider>
              )}

              {isNew && (
                <Badge color="success" pill className="position-absolute t-0 r-0 mr-2 mt-2 fs--2 z-index-2">
                  New
                </Badge>
              )}
            </div>
          </Col>
          <Col sm={7} md={8}>
            <Row>
              <Col lg={8}>
                <h5 className="mt-3 mt-sm-0">
                  <Link className="text-dark fs-0 fs-lg-1" to={`/e-commerce/product-details/${id}`}>
                    {title}
                  </Link>
                </h5>
                <p className="fs--1 mb-2 mb-md-3">
                  <a className="text-500" href="#!">
                    {category}
                  </a>
                </p>
                {isIterableArray(features) && (
                  <ul className="list-unstyled d-none d-lg-block">
                    {features.map((feature, index) => (
                      <li key={index}>
                        <FontAwesomeIcon icon="circle" transform="shrink-12" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Col>
              <Col lg={4} tag={Flex} justify="between" column>
                <div>
                  <h4 className="fs-1 fs-md-2 text-warning mb-0">
                    {currency}
                    {!!sale ? price - price * (sale / 100) : price}
                  </h4>
                  {!!sale && (
                    <h5 className="fs--1 text-500 mb-0 mt-1">
                      <del>
                        {currency}
                        {price}
                      </del>
                      <span className="ml-1">-{sale}%</span>
                    </h5>
                  )}
                  <div className="mb-2 mt-3">
                    <StarCount stars={rating} />
                    <span className="ml-1">({review})</span>
                  </div>
                  <div className="d-none d-lg-block">
                    <p className="fs--1 mb-1">
                      Shipping Cost: <strong>{shippingCost === 0 ? 'Free' : `${currency}${shippingCost}`}</strong>
                    </p>
                    <p className="fs--1 mb-1">
                      Stock:{' '}
                      <strong className={classNames({ 'text-success': isInStock, 'text-danger': !isInStock })}>
                        {isInStock ? 'Available' : 'Sold-Out'}
                      </strong>
                    </p>
                  </div>
                </div>
                <div className="mt-md-2">
                  <ButtonIcon
                    color={isInFavouriteItems(id) ? 'outline-danger' : 'outline-secondary'}
                    size="sm"
                    className={classNames('w-lg-100 mt-2 mr-2 mr-lg-0', {
                      'border-300': !isInFavouriteItems(id)
                    })}
                    icon={[isInFavouriteItems(id) ? 'fas' : 'far', 'heart']}
                    onClick={() =>
                      isInFavouriteItems(id)
                        ? favouriteItemsDispatch({ type: 'REMOVE', id })
                        : favouriteItemsDispatch({ type: 'ADD', payload: { id } })
                    }
                  >
                    Favourite
                  </ButtonIcon>
                  {cartLoading ? (
                    <ButtonIcon
                      color="primary"
                      size="sm"
                      icon="circle-notch"
                      iconClassName="fa-spin ml-2 d-none d-md-inline-block"
                      className="w-lg-100 mt-2"
                      style={{ cursor: 'progress' }}
                      disabled
                    >
                      Processing
                    </ButtonIcon>
                  ) : (
                    <ButtonIcon
                      color="primary"
                      size="sm"
                      icon="cart-plus"
                      iconClassName="ml-2 d-none d-md-inline-block"
                      className="w-lg-100 mt-2"
                      onClick={handleAddToCart}
                    >
                      Add to Cart
                    </ButtonIcon>
                  )}
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </Col>
  );
};

ProductList.propTypes = {
  title: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  rating: PropTypes.number.isRequired,
  review: PropTypes.number.isRequired,
  shippingCost: PropTypes.number.isRequired,
  sliderSettings: PropTypes.object.isRequired,
  files: PropTypes.array,
  sale: PropTypes.number,
  oldPrice: PropTypes.number,
  price: PropTypes.number,
  isInStock: PropTypes.bool,
  isNew: PropTypes.bool,
  features: PropTypes.array
};

ProductList.defaultProps = { isNew: false, isInStock: false, files: [] };

export default ProductList;
