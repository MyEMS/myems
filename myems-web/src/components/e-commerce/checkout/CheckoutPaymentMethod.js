import React, { useState, useContext, Fragment } from 'react';
import PropTypes from 'prop-types';
import AppContext, { ProductContext } from '../../../context/Context';
import { Button, Card, CardBody, Col, CustomInput, FormGroup, Media, Row, UncontrolledTooltip } from 'reactstrap';
import FalconCardHeader from '../../common/FalconCardHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconInput from '../../common/FalconInput';
import Flex from '../../common/Flex';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import iconPaymentMethodsGrid from '../../../assets/img/icons/icon-payment-methods-grid.png';
import iconPaypalFull from '../../../assets/img/icons/icon-paypal-full.png';
import shield from '../../../assets/img/icons/shield.png';

const CheckoutPaymentMethod = ({ payableTotal, paymentMethod, setPaymentMethod }) => {
  const { currency } = useContext(AppContext);
  const { shoppingCart, shoppingCartDispatch } = useContext(ProductContext);
  const [cardNumber, setCardNumber] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handlePayment = () => {
    toast(
      <div className="text-700">
        <h5 className="text-success fs-0 mb-0">Payment success!</h5>
        <hr className="my-2" />
        Total:{' '}
        <strong>
          {currency}
          {payableTotal}
        </strong>
        <br />
        Payment method: <strong className="text-capitalize">{paymentMethod.split('-').join(' ')}</strong>
      </div>
    );
    shoppingCart.map(({ id }) => shoppingCartDispatch({ type: 'REMOVE', id }));
  };

  const labelClassName = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';
  return (
    <Card className="mb-3">
      <FalconCardHeader title="Payment Method" titleTag="h5" />
      <CardBody>
        <Row form>
          <Col xs={12}>
            <CustomInput
              label={
                <Flex align="center" className="mb-2 fs-1">
                  Credit Card
                </Flex>
              }
              id="credit-card"
              value="credit-card"
              checked={paymentMethod === 'credit-card'}
              onChange={({ target }) => setPaymentMethod(target.value)}
              type="radio"
            />
          </Col>
          <Col xs={12} className="pl-4">
            <Row>
              <Col sm={8}>
                <Row form className="align-items-center">
                  <Col>
                    <FormGroup>
                      <FalconInput
                        label="Card Number"
                        labelClassName={labelClassName}
                        className="input-spin-none"
                        placeholder="•••• •••• •••• ••••"
                        value={cardNumber}
                        onChange={setCardNumber}
                        type="number"
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Row form className="align-items-center">
                  <Col xs={6}>
                    <FormGroup>
                      <FalconInput
                        label="Exp Date"
                        labelClassName={labelClassName}
                        placeholder="mm/yyyy"
                        value={expDate}
                        onChange={setExpDate}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={6}>
                    <FormGroup>
                      <FalconInput
                        label={
                          <Fragment>
                            CVV
                            <span className="d-inline-block cursor-pointer text-primary" id="CVVTooltip">
                              <FontAwesomeIcon icon="question-circle" className="mx-2" />
                            </span>
                            <UncontrolledTooltip placement="top" target="CVVTooltip">
                              Card verification value
                            </UncontrolledTooltip>
                          </Fragment>
                        }
                        labelClassName={labelClassName}
                        className="input-spin-none"
                        placeholder="123"
                        maxLength="3"
                        pattern="[0-9]{3}"
                        value={cvv}
                        onChange={setCvv}
                      />
                    </FormGroup>
                  </Col>
                </Row>
              </Col>
              <div className="col-4 text-center pt-2 d-none d-sm-block">
                <div className="rounded p-2 mt-3 bg-100">
                  <div className="text-uppercase fs--2 font-weight-bold">We Accept</div>
                  <img src={iconPaymentMethodsGrid} alt="" width="120" />
                </div>
              </div>
            </Row>
          </Col>
        </Row>
        <Row className="mt-3">
          <Col xs={12}>
            <CustomInput
              label={<img className="pull-right" src={iconPaypalFull} height="20" alt="" />}
              id="paypal"
              value="paypal"
              checked={paymentMethod === 'paypal'}
              onChange={({ target }) => setPaymentMethod(target.value)}
              type="radio"
            />
          </Col>
        </Row>
        <hr className="border-dashed my-5" />
        <Row>
          <Col md={7} xl={12} className="col-xxl-7 vertical-line px-md-3 mb-xxl-0">
            <Media>
              <img className="" src={shield} alt="" width="60" />
              <Media body className="ml-3">
                <h5 className="mb-2">Buyer Protection</h5>
                <CustomInput
                  id="protection-option-1"
                  label={
                    <Fragment>
                      <strong>Full Refund </strong>If you don't <br className="d-none d-md-block d-lg-none" />
                      receive your order
                    </Fragment>
                  }
                  type="checkbox"
                />
                <CustomInput
                  id="protection-option-2"
                  label={
                    <Fragment>
                      <strong>Full or Partial Refund, </strong>If the product is not as described in details
                    </Fragment>
                  }
                  type="checkbox"
                />
                <Link className="fs--1 ml-3 pl-2" to="#!">
                  Learn More
                  <FontAwesomeIcon icon="caret-right" transform="down-2" className="ml-1" />
                </Link>
              </Media>
            </Media>
          </Col>
          <Col
            md={5}
            xl={12}
            className="col-xxl-5 pl-lg-4 pl-xl-2 pl-xxl-5 text-center text-md-left text-xl-center text-xxl-left"
          >
            <hr className="border-dashed d-block d-md-none d-xl-block d-xxl-none my-4" />
            <div className="fs-2 font-weight-semi-bold">
              All Total:{' '}
              <span className="text-primary">
                {currency}
                {payableTotal}
              </span>
            </div>
            <Button
              color="success"
              className="mt-3 px-5"
              type="submit"
              disabled={!payableTotal}
              onClick={handlePayment}
            >
              Confirm &amp; Pay
            </Button>
            <p className="fs--1 mt-3 mb-0">
              By clicking <strong>Confirm &amp; Pay </strong>button you agree to the{' '}
              <Link to="#!">Terms &amp; Conditions</Link>
            </p>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

CheckoutPaymentMethod.propTypes = {
  payableTotal: PropTypes.number.isRequired,
  paymentMethod: PropTypes.string.isRequired,
  setPaymentMethod: PropTypes.func.isRequired
};

export default CheckoutPaymentMethod;
