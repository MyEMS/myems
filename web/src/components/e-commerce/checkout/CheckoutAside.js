import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import AppContext, { ProductContext } from '../../../context/Context';
import { Alert, Card, CardBody, CardFooter, Media, Table } from 'reactstrap';
import FalconCardHeader from '../../common/FalconCardHeader';
import ButtonIcon from '../../common/ButtonIcon';
import { Link } from 'react-router-dom';
import { calculateSale, isIterableArray } from '../../../helpers/utils';
import Flex from '../../common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CheckoutAside = ({ calculatedShippingCost, subTotal, payableTotal }) => {
  const { currency } = useContext(AppContext);
  const { products, shoppingCart, appliedPromo } = useContext(ProductContext);
  const total = (parseFloat(subTotal) + calculatedShippingCost).toFixed(2);

  return (
    <Card>
      <FalconCardHeader title="Order Summary" titleTag="h5" light={false}>
        <ButtonIcon
          color="link"
          size="sm"
          tag={Link}
          icon="pencil-alt"
          className="btn-reveal text-600"
          to="/e-commerce/shopping-cart"
        />
      </FalconCardHeader>
      {isIterableArray(shoppingCart) ? (
        <Fragment>
          <CardBody className="pt-0">
            <Table borderless className="fs--1 mb-0">
              <tbody>
                {shoppingCart.map(({ id, quantity }) => {
                  const { title, price, sale, features } = products.find(product => product.id === id);
                  return (
                    <tr className="border-bottom" key={id}>
                      <th className="pl-0">
                        {title} x {quantity}
                        {isIterableArray(features) && (
                          <div className="text-400 font-weight-normal fs--2">
                            {features.map(feature => `${feature} `)}
                          </div>
                        )}
                      </th>
                      <th className="pr-0 text-right">
                        {currency}
                        {calculateSale(price, sale) * quantity}
                      </th>
                    </tr>
                  );
                })}
                <tr className="border-bottom">
                  <th className="pl-0">Subtotal</th>
                  <th className="pr-0 text-right">
                    {currency}
                    {subTotal}
                  </th>
                </tr>

                <tr className="border-bottom">
                  <th className="pl-0">Shipping</th>
                  <th className="pr-0 text-right text-nowrap">
                    + {currency}
                    {calculatedShippingCost}
                  </th>
                </tr>
                <tr>
                  <th className="pl-0 pb-0">Total</th>
                  <th className="pr-0 text-right pb-0 text-nowrap">
                    {currency}
                    {total}
                  </th>
                </tr>
                {!!appliedPromo && (
                  <tr className="border-bottom">
                    <th className="pl-0">
                      Coupon: <span className="text-success">{appliedPromo.code}</span> (-{appliedPromo.discount}%)
                    </th>
                    <th className="pr-0 text-right text-nowrap">
                      - {currency}
                      {calculateSale(subTotal, 100 - appliedPromo.discount)}
                    </th>
                  </tr>
                )}
              </tbody>
            </Table>
          </CardBody>
          <CardFooter tag={Flex} justify="between" className="bg-100">
            <div className="font-weight-semi-bold">Payable Total</div>
            <div className="font-weight-bold">
              {currency}
              {payableTotal}
            </div>
          </CardFooter>
        </Fragment>
      ) : (
        <CardBody className="p-0">
          <Alert color="warning" className="mb-0 rounded-0 overflow-hidden">
            <Media className="align-items-center">
              <FontAwesomeIcon icon={['far', 'dizzy']} className="fs-5" />
              <Media body className="ml-3">
                <p className="mb-0">You have no items in your shopping cart. Go ahead and start shopping!</p>
              </Media>
            </Media>
          </Alert>
        </CardBody>
      )}
    </Card>
  );
};

CheckoutAside.propTypes = {
  calculatedShippingCost: PropTypes.number.isRequired,
  subTotal: PropTypes.number.isRequired,
  payableTotal: PropTypes.number.isRequired
};

export default CheckoutAside;
