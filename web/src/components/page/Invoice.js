import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardFooter, Col, Row, Table } from 'reactstrap';
import Loader from '../common/Loader';
import ButtonIcon from '../common/ButtonIcon';
import createMarkup from '../../helpers/createMarkup';
import { isIterableArray } from '../../helpers/utils';
import useFakeFetch from '../../hooks/useFakeFetch';
import rawInvoice from '../../data/invoice/invoice';

const calculateSubtotal = products => {
  return products.reduce((currentValue, product) => {
    return product.quantity * product.rate + currentValue;
  }, 0);
};

const formatCurrency = (number, currency) =>
  `${currency}${number.toFixed(2).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')}`;

const ProductTr = ({ name, description, quantity, rate }) => {
  return (
    <tr>
      <td className="align-middle">
        <h6 className="mb-0 text-nowrap">{name}</h6>
        <p className="mb-0">{description}</p>
      </td>
      <td className="align-middle text-center">{quantity}</td>
      <td className="align-middle text-right">${rate}</td>
      <td className="align-middle text-right">${quantity * rate}</td>
    </tr>
  );
};

ProductTr.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  quantity: PropTypes.number.isRequired,
  rate: PropTypes.number.isRequired
};

const InvoiceHeader = ({ institution, logo, address }) => (
  <Row className="align-items-center text-center mb-3">
    <Col sm={6} className="text-sm-left">
      <img src={logo} alt="invoice" width={150} />
    </Col>
    <Col className="text-sm-right mt-3 mt-sm-0">
      <h2 className="mb-3">Invoice</h2>
      <h5>{institution}</h5>
      {address && <p className="fs--1 mb-0" dangerouslySetInnerHTML={createMarkup(address)} />}
    </Col>
    <Col xs={12}>
      <hr />
    </Col>
  </Row>
);

InvoiceHeader.propTypes = {
  institution: PropTypes.string.isRequired,
  logo: PropTypes.string.isRequired,
  address: PropTypes.string
};

const Invoice = () => {
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const { loading: invoiceLoading, data: invoice } = useFakeFetch(rawInvoice);

  useEffect(() => {
    if (isIterableArray(invoice.products)) {
      setSubtotal(calculateSubtotal(invoice.products));
    }
  }, [invoice]);

  useEffect(() => {
    setTax(subtotal * invoice.tax);
  }, [subtotal, invoice]);

  useEffect(() => {
    setTotal(subtotal + tax);
  }, [subtotal, tax]);

  return (
    <Fragment>
      <Card className="mb-3">
        <CardBody>
          <Row className="justify-content-between align-items-center">
            <Col md>
              <h5 className="mb-2 mb-md-0">Order #{invoiceLoading ? '' : invoice.summary.order_number}</h5>
            </Col>
            <Col xs="auto">
              <ButtonIcon color="falcon-default" size="sm" icon="arrow-down" className="mr-2 mb-2 mb-sm-0">
                Download (.pdf)
              </ButtonIcon>
              <ButtonIcon color="falcon-default" size="sm" icon="print" className="mr-2 mb-2 mb-sm-0">
                Print
              </ButtonIcon>
              <ButtonIcon color="falcon-success" size="sm" icon="dollar-sign" className="mb-2 mb-sm-0">
                Receive Payment
              </ButtonIcon>
            </Col>
          </Row>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          {invoiceLoading ? (
            <Loader />
          ) : (
            <InvoiceHeader institution={invoice.institution} logo={invoice.logo} address={invoice.address} />
          )}

          {invoiceLoading ? (
            <Loader />
          ) : (
            <Row className="justify-content-between align-items-center">
              <Col>
                <h6 className="text-500">Invoice to</h6>
                <h5>{invoice.user.name}</h5>
                <p className="fs--1" dangerouslySetInnerHTML={createMarkup(invoice.user.address)} />
                <p className="fs--1">
                  <a href={`mailto:${invoice.user.email}`}>{invoice.user.email}</a>
                  <br />
                  <a href={`tel:${invoice.user.cell.split('-').join('')}`}>{invoice.user.cell}</a>
                </p>
              </Col>
              <Col sm="auto" className="ml-auto">
                <div className="table-responsive">
                  <Table size="sm" borderless className="fs--1">
                    <tbody>
                      <tr>
                        <th className="text-sm-right">Invoice No:</th>
                        <td>{invoice.summary.invoice_no}</td>
                      </tr>
                      <tr>
                        <th className="text-sm-right">Order Number:</th>
                        <td>{invoice.summary.order_number}</td>
                      </tr>
                      <tr>
                        <th className="text-sm-right">Invoice Date:</th>
                        <td>{invoice.summary.invoice_date}</td>
                      </tr>
                      <tr>
                        <th className="text-sm-right">Payment Due:</th>
                        <td>{invoice.summary.payment_due}</td>
                      </tr>
                      <tr className="alert-success font-weight-bold">
                        <th className="text-sm-right">Amount Due:</th>
                        <td>{formatCurrency(invoice.summary.amount_due, invoice.currency)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Col>
            </Row>
          )}

          {invoiceLoading ? (
            <Loader />
          ) : (
            <div className="table-responsive mt-4 fs--1">
              <Table striped className="border-bottom">
                <thead>
                  <tr className="bg-primary text-white">
                    <th className="border-0">Products</th>
                    <th className="border-0 text-center">Quantity</th>
                    <th className="border-0 text-right">Rate</th>
                    <th className="border-0 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {isIterableArray(invoice.products) &&
                    invoice.products.map((product, index) => <ProductTr {...product} key={index} />)}
                </tbody>
              </Table>
            </div>
          )}

          {invoiceLoading ? (
            <Loader />
          ) : (
            <Row noGutters className="justify-content-end">
              <Col xs="auto">
                <Table size="sm" borderless className="fs--1 text-right">
                  <tbody>
                    <tr>
                      <th className="text-900">Subtotal:</th>
                      <td className="font-weight-semi-bold">{formatCurrency(subtotal, invoice.currency)}</td>
                    </tr>
                    <tr>
                      <th className="text-900">Tax 8%:</th>
                      <td className="font-weight-semi-bold">{formatCurrency(tax, invoice.currency)}</td>
                    </tr>
                    <tr className="border-top">
                      <th className="text-900">Total:</th>
                      <td className="font-weight-semi-bold">{formatCurrency(total, invoice.currency)}</td>
                    </tr>
                    <tr className="border-top border-2x font-weight-bold text-900">
                      <th>Amount Due:</th>
                      <td>{formatCurrency(invoice.summary.amount_due + total, invoice.currency)}</td>
                    </tr>
                  </tbody>
                </Table>
              </Col>
            </Row>
          )}
        </CardBody>
        <CardFooter className="bg-light">
          <p className="fs--1 mb-0">
            <strong>Notes: </strong>We really appreciate your business and if there’s anything else we can do, please
            let us know!
          </p>
        </CardFooter>
      </Card>
    </Fragment>
  );
};

export default Invoice;
