import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { Badge, Col } from 'reactstrap';
import Flex from '../../common/Flex';
import { Link } from 'react-router-dom';
import { isIterableArray } from '../../../helpers/utils';
import Slider from 'react-slick/lib';
import StarCount from './StarCount';
import classNames from 'classnames';
import ButtonIcon from '../../common/ButtonIcon';
import AppContext, { ProductContext } from '../../../context/Context';

const ProductGrid = ({
  id,
  files,
  title,
  category,
  price,
  sale,
  rating,
  review,
  shippingCost,
  isInStock,
  isNew,
  sliderSettings,
  ...rest
}) => {
  const { currency } = useContext(AppContext);
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
    <Col className="mb-4" {...rest}>
      <Flex justify="between" column className="border rounded h-100 pb-3">
        <div className="overflow-hidden">
          <div className="position-relative rounded-top overflow-hidden">
            {isIterableArray(files) && files.length === 1 && (
              <Link className="d-block h-100" to={`/e-commerce/product-details/${id}`}>
                <img
                  className="img-fluid rounded-top"
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
          <div className="p-3">
            <h5 className="fs-0">
              <Link className="text-dark" to={`/e-commerce/product-details/${id}`}>
                {title}
              </Link>
            </h5>
            <p className="fs--1 mb-3">
              <a className="text-500" href="#!">
                {category}
              </a>
            </p>

            <Flex tag="h5" align="center" className="fs-md-2 text-warning mb-0 mb-3">
              {currency}
              {!!sale ? price - price * (sale / 100) : price}
              {!!sale && (
                <del className="ml-2 fs--1 text-500">
                  {currency}
                  {price}
                </del>
              )}
            </Flex>
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

        <Flex align="center" justify="between" className="px-3">
          <div>
            <StarCount stars={rating} />
            <span className="ml-1">({review})</span>
          </div>
          <div>
            <ButtonIcon
              color={isInFavouriteItems(id) ? 'falcon-danger' : 'falcon-default'}
              size="sm"
              icon={[isInFavouriteItems(id) ? 'fas' : 'far', 'heart']}
              onClick={() =>
                isInFavouriteItems(id)
                  ? favouriteItemsDispatch({ type: 'REMOVE', id })
                  : favouriteItemsDispatch({ type: 'ADD', payload: { id } })
              }
              className="mr-2"
            />
            {cartLoading ? (
              <ButtonIcon
                color="primary"
                size="sm"
                icon="circle-notch"
                iconClassName="fa-spin"
                style={{ cursor: 'progress' }}
                disabled
              />
            ) : (
              <ButtonIcon color="primary" size="sm" icon="cart-plus" onClick={handleAddToCart} />
            )}
          </div>
        </Flex>
      </Flex>
    </Col>
  );
};

ProductGrid.propTypes = {
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

ProductGrid.defaultProps = { isNew: false, isInStock: false, files: [] };

export default ProductGrid;
