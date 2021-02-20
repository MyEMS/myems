import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Media, Progress } from 'reactstrap';
import Flex from '../common/Flex';
import AppContext from '../../context/Context';
import { Link } from 'react-router-dom';

const getProductItemCalculatedData = (unit, price, totalPrice) => {
  const productTotalPrice = unit * price;
  const percentage = ((productTotalPrice * 100) / totalPrice).toFixed(0);
  return { productTotalPrice, percentage };
};

const BestSellingProduct = ({ product, totalPrice, isLast }) => {
  const { currency } = useContext(AppContext);
  const { img, title, type, unit, price } = product;
  const { productTotalPrice, percentage } = getProductItemCalculatedData(unit, price, totalPrice);

  return (
    <tr className={classNames({ 'border-bottom border-200': !isLast })}>
      <td>
        <Media className="align-items-center position-relative">
          <img className="rounded border border-200" src={img} width="60" alt={title} />
          <Media body className="ml-3">
            <h6 className="mb-1 font-weight-semi-bold">
              <Link className="text-dark stretched-link" to="#!">
                {title}
              </Link>
            </h6>
            <p className="font-weight-semi-bold mb-0 text-500">{type}</p>
          </Media>
        </Media>
      </td>
      <td className="align-middle text-right font-weight-semi-bold">
        {currency}
        {productTotalPrice}
      </td>
      <td className="align-middle pr-card">
        <Flex align="center">
          <Progress
            value={percentage}
            color="primary"
            className="w-100 mr-2 rounded-soft bg-200"
            barClassName="rounded-capsule"
            style={{ height: '5px' }}
          />
          <div className="font-weight-semi-bold ml-2">{percentage}%</div>
        </Flex>
      </td>
    </tr>
  );
};

BestSellingProduct.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    img: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    unit: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired
  }).isRequired,
  totalPrice: PropTypes.number.isRequired,
  isLast: PropTypes.bool
};

BestSellingProduct.defaultProps = { isLast: false };

export default BestSellingProduct;
