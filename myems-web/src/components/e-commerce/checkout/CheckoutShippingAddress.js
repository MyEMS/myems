import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, Col, Input, Label, Row } from 'reactstrap';
import FalconCardHeader from '../../common/FalconCardHeader';
import ButtonIcon from '../../common/ButtonIcon';

const CheckoutShippingAddress = ({ shippingAddress, setShippingAddress }) => (
  <Card className="mb-3">
    <FalconCardHeader title="Your Shipping Address" titleTag="h5">
      <ButtonIcon icon="plus" color="falcon-default" size="sm" transform="shrink-2">
        Add New Address
      </ButtonIcon>
    </FalconCardHeader>
    <CardBody>
      <Row>
        <Col md={6} className="mb-3 mb-md-0">
          <div className="custom-control custom-radio radio-select">
            <Input
              className="custom-control-input"
              id="address-1"
              type="radio"
              value="address-1"
              checked={shippingAddress === 'address-1'}
              onChange={({ target }) => setShippingAddress(target.value)}
            />
            <Label className="custom-control-label font-weight-bold d-block" htmlFor="address-1">
              Antony Hopkins
              <span className="radio-select-content">
                <span>
                  {' '}
                  2392 Main Avenue,
                  <br />
                  Pensaukee,
                  <br />
                  New Jersey 02139<span className="d-block mb-0 pt-2">+(856) 929-229</span>
                </span>
              </span>
            </Label>
            <small className="text-primary cursor-pointer">Edit</small>
          </div>
        </Col>
        <Col md={6}>
          <div className="position-relative">
            <div className="custom-control custom-radio radio-select">
              <Input
                className="custom-control-input"
                id="address-2"
                type="radio"
                value="address-2"
                checked={shippingAddress === 'address-2'}
                onChange={({ target }) => setShippingAddress(target.value)}
              />
              <Label className="custom-control-label font-weight-bold d-block" htmlFor="address-2">
                Robert Bruce
                <span className="radio-select-content">
                  <span>
                    3448 Ile De France St #242,
                    <br />
                    Fort Wainwright, <br />
                    Alaska, 99703<span className="d-block mb-0 pt-2">+(901) 637-734</span>
                  </span>
                </span>
              </Label>
              <small className="text-primary cursor-pointer">Edit</small>
            </div>
          </div>
        </Col>
      </Row>
    </CardBody>
  </Card>
);

CheckoutShippingAddress.propTypes = {
  shippingAddress: PropTypes.string.isRequired,
  setShippingAddress: PropTypes.func.isRequired
};

export default CheckoutShippingAddress;
