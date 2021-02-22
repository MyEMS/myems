import React, { Fragment, useContext } from 'react';
import { Col, Table, Card, CardBody, Row, Media } from 'reactstrap';
import { getTotalPrice } from '../../helpers/utils';
import AppContext from '../../context/Context';

import visa from '../../assets/img/icons/visa.jpg';

import orderedProducts from '../../data/e-commerce/orderedProducts';
import OrderDetailsHeader from './OrderDetailsHeader';

const OrderDetails = () => {
  const { currency } = useContext(AppContext);
  const subtotal = getTotalPrice(orderedProducts, orderedProducts);

  return (
    <Fragment>
      <OrderDetailsHeader />
      <Card className="mb-3">
        <CardBody>
          <Row>
            <Col lg={4}>
              <h5 className="mb-3 fs-0">Billing Address</h5>
              <h6 className="mb-2">Antony Hopkins</h6>
              <p className="mb-1 fs--1">
                2393 Main Avenue
                <br />
                Penasauka, New Jersey 87896
              </p>
              <p className="mb-0 fs--1">
                <strong>Email: </strong>
                <a href="mailto:ricky@gmail.com">antony@example.com</a>
              </p>
              <p className="mb-0 fs--1">
                <strong>Phone: </strong>
                <a href="tel:7897987987">7897987987</a>
              </p>
            </Col>
            <Col lg={4}>
              <h5 className="mb-3 fs-0">Shipping Address</h5>
              <h6 className="mb-2">Antony Hopkins</h6>
              <p className="mb-0 fs--1">
                2393 Main Avenue
                <br />
                Penasauka, New Jersey 87896
              </p>
              <div className="text-500 fs--1">(Free Shipping)</div>
            </Col>
            <Col lg={4}>
              <h5 className="mb-3 fs-0">Payment Method</h5>
              <Media>
                <img className="mr-3" src={visa} width="40" alt="" />
                <Media body>
                  <h6 className="mb-0">Antony Hopkins</h6>
                  <p className="mb-0 fs--1">**** **** **** 9809</p>
                </Media>
              </Media>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <Card className="mb-3">
        <CardBody>
          <div className="table-responsive fs--1">
            <Table striped className="border-bottom border-200">
              <thead className="bg-200 text-900">
                <tr>
                  <th className="border-0">Products</th>
                  <th className="border-0 text-center">Quantity</th>
                  <th className="border-0 text-right">Rate</th>
                  <th className="border-0 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {orderedProducts.map(({ id, title, description, quantity, price }) => (
                  <tr key={id}>
                    <td className="align-middle border-200">
                      <h6 className="mb-0 text-nowrap">{title}</h6>
                      <p className="mb-0">{description}</p>
                    </td>
                    <td className="align-middle text-center border-200">{quantity}</td>
                    <td className="align-middle text-right border-200">
                      {currency}
                      {price}
                    </td>
                    <td className="align-middle text-right border-200">
                      {currency}
                      {price * quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <Row className="row no-gutters justify-content-end">
            <div className="col-auto">
              <table className="table table-sm table-borderless fs--1 text-right">
                <tbody>
                  <tr>
                    <th className="text-900">Subtotal:</th>
                    <td className="font-weight-semi-bold">
                      {currency}
                      {subtotal}
                    </td>
                  </tr>
                  <tr>
                    <th className="text-900">Tax 5%:</th>
                    <td className="font-weight-semi-bold">
                      {currency}
                      {subtotal * 0.05}
                    </td>
                  </tr>
                  <tr className="border-top">
                    <th className="text-900">Total:</th>
                    <td className="font-weight-semi-bold">
                      {currency}
                      {subtotal * 1.05}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default OrderDetails;
