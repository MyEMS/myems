import React, { Fragment, useState, useContext } from 'react';
import ContentWithAsideLayout from '../../layouts/ContentWithAsideLayout';
import { ProductContext } from '../../context/Context';
import { calculateSale, getTotalPrice } from '../../helpers/utils';
import CheckoutAside from './checkout/CheckoutAside';
import CheckoutShippingAddress from './checkout/CheckoutShippingAddress';
import CheckoutPaymentMethod from './checkout/CheckoutPaymentMethod';

const Checkout = () => {
  const { products, shoppingCart, appliedPromo } = useContext(ProductContext);
  const [shippingAddress, setShippingAddress] = useState('address-1');
  const [paymentMethod, setPaymentMethod] = useState('credit-card');

  const calculatedShippingCost = parseFloat(
    shoppingCart
      .map(shoppingCartItem => products.find(product => product.id === shoppingCartItem.id))
      .filter(product => product.hasOwnProperty('shippingCost') && product.shippingCost !== 0)
      .reduce((accumulated, product) => (accumulated > product.shippingCost ? accumulated : product.shippingCost), 0)
  );
  const subTotal = parseFloat(getTotalPrice(shoppingCart, products).toFixed(2));
  const payableTotal = parseFloat(
    (parseFloat(calculateSale(subTotal, !!appliedPromo ? appliedPromo.discount : 0)) + calculatedShippingCost).toFixed(
      2
    )
  );

  return (
    <ContentWithAsideLayout
      aside={
        <CheckoutAside
          calculatedShippingCost={calculatedShippingCost}
          subTotal={subTotal}
          payableTotal={payableTotal}
        />
      }
      isStickyAside={false}
    >
      <Fragment>
        <CheckoutShippingAddress shippingAddress={shippingAddress} setShippingAddress={setShippingAddress} />
        <CheckoutPaymentMethod
          payableTotal={payableTotal}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
        />
      </Fragment>
    </ContentWithAsideLayout>
  );
};

export default Checkout;
