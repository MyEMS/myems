import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Button,
  Card,
  CardBody,
  Col,
  CustomInput,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Form,
  FormGroup,
  Input,
  Label,
  Row,
  UncontrolledDropdown,
  UncontrolledTooltip
} from 'reactstrap';
import ContentWithAsideLayout from '../../layouts/ContentWithAsideLayout';
import FalconCardHeader from '../common/FalconCardHeader';
import iconPaypalFull from '../../assets/img/icons/icon-paypal-full.png';
import iconPaymentMethods from '../../assets/img/icons/icon-payment-methods.png';
import PageHeader from '../common/PageHeader';
import FaqCol from '../faq/FaqCol';
import { isIterableArray } from '../../helpers/utils';
import countries from '../../data/billing/countries';

export const BillingBanner = () => (
  <PageHeader
    title="Get started with your free trial"
    description="Premium team - 5 Seats. Free for 30 days, cancel at any time.<br/>$6.25 / seat month after a trial"
    className="mb-3"
  >
    <UncontrolledDropdown>
      <DropdownToggle caret color="link" size="sm" className="pl-0">
        Change plan
      </DropdownToggle>
      <DropdownMenu className="py-0" style={{ minWidth: '15rem' }}>
        <div className="bg-white py-3 rounded-soft">
          <DropdownItem tag="div" className="text-base px-3 py-2">
            <span className="d-flex justify-content-between fs--1 text-black">
              <span className="font-weight-semi-bold">Standard License</span>
              <span>$59.00</span>
            </span>
            <ul className="list-unstyled pl-1 my-2 fs--1">
              <li>
                <FontAwesomeIcon icon="circle" transform="shrink-11" />
                <span className="ml-1">Use for a single product</span>
              </li>
              <li>
                <FontAwesomeIcon icon="circle" transform="shrink-11" />
                <span className="ml-1">Non-paying users only</span>
              </li>
            </ul>
            <p className="fs--2 mb-0">
              Read the full <Link to="#!">Standard License</Link>
            </p>
          </DropdownItem>
          <DropdownItem divider className="my-0" />
          <DropdownItem tag="div" className="text-base px-3 py-2">
            <span className="d-flex justify-content-between fs--1 text-black">
              <span className="font-weight-semi-bold">Extended License</span>
              <span>$99.00</span>
            </span>
            <ul className="list-unstyled pl-1 my-2 fs--1">
              <li>
                <FontAwesomeIcon icon="circle" transform="shrink-11" />
                <span className="ml-1">Unlimited websites</span>
              </li>
              <li>
                <FontAwesomeIcon icon="circle" transform="shrink-11" />
                <span className="ml-1">Paying users allowed</span>
              </li>
            </ul>
            <p className="fs--2 mb-0">
              Read the full <Link to="#!">Extended License</Link>
            </p>
          </DropdownItem>
        </div>
      </DropdownMenu>
    </UncontrolledDropdown>
  </PageHeader>
);

const BillingContent = () => {
  const [method, setMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [country, setCountry] = useState('United States');
  const [zip, setZip] = useState('');
  const [expDate, setExpDate] = useState('');
  const [cvv, setCvv] = useState('');

  const labelClasses = 'ls text-uppercase text-600 font-weight-semi-bold mb-0';

  return (
    <Card className="h-100">
      <FalconCardHeader title="Billing Details" light={false} />
      <CardBody className="bg-light">
        <Row tag={Form}>
          <Col>
            <CustomInput
              type="radio"
              name="billing"
              id="paypal"
              value="paypal"
              checked={method === 'paypal'}
              onChange={({ target }) => setMethod(target.value)}
              label={<img src={iconPaypalFull} height={20} alt="" />}
            />
            <p className="fs--1 mb-4">Pay with PayPal, Apple Pay, PayPal Credit and much more</p>

            <CustomInput
              type="radio"
              name="billing"
              id="card"
              value="card"
              checked={method === 'card'}
              onChange={({ target }) => setMethod(target.value)}
              label={
                <span className="d-flex align-items-center">
                  <span className="fs-1 text-nowrap">Credit Card</span>
                  <img className="d-none d-sm-inline-block ml-2 mt-lg-0" src={iconPaymentMethods} height={20} alt="" />
                </span>
              }
            />
            <p className="fs--1 mb-4">
              Safe money transfer using your bank accounts. Visa, maestro, discover, american express.
            </p>

            <Row form>
              <Col>
                <FormGroup>
                  <Label className={labelClasses} for="cardNumber">
                    Card Number
                  </Label>
                  <Input
                    placeholder="XXXX XXXX XXXX XXXX"
                    id="cardNumber"
                    value={cardNumber}
                    onChange={({ target }) => setCardNumber(target.value)}
                  />
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <Label className={labelClasses} for="cardName">
                    Name of Card
                  </Label>
                  <Input
                    placeholder="John Doe"
                    id="cardName"
                    value={cardName}
                    onChange={({ target }) => setCardName(target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
            <Row form>
              <Col xs={6} sm={3}>
                <FormGroup>
                  <Label className={labelClasses} for="customSelectCountry">
                    Country
                  </Label>
                  <CustomInput
                    type="select"
                    id="country"
                    name="country"
                    value={country}
                    onChange={({ target }) => setCountry(target.value)}
                  >
                    {isIterableArray(countries) &&
                      countries.map((country, index) => (
                        <option value={country} key={index}>
                          {country}
                        </option>
                      ))}
                  </CustomInput>
                </FormGroup>
              </Col>
              <Col xs={6} sm={3}>
                <FormGroup className="form-group">
                  <Label className={labelClasses} for="zipCode">
                    Zip Code
                  </Label>
                  <Input placeholder="1234" id="zipCode" value={zip} onChange={({ target }) => setZip(target.value)} />
                </FormGroup>
              </Col>
              <Col xs={6} sm={3}>
                <FormGroup>
                  <Label className={labelClasses} for="expDate">
                    Exp Date
                  </Label>
                  <Input
                    placeholder="15/2024"
                    id="expDate"
                    value={expDate}
                    onChange={({ target }) => setExpDate(target.value)}
                  />
                </FormGroup>
              </Col>
              <Col xs={6} sm={3}>
                <FormGroup>
                  <Label className={labelClasses} for="cvv">
                    CVV
                    <FontAwesomeIcon icon="question-circle" className="ml-2 cursor-pointer" id="tooltipCVV" />
                    <UncontrolledTooltip placement="top" target="tooltipCVV">
                      Card verification value
                    </UncontrolledTooltip>
                  </Label>
                  <Input
                    placeholder="123"
                    maxLength="3"
                    id="cvv"
                    value={cvv}
                    onChange={({ target }) => setCvv(target.value)}
                  />
                </FormGroup>
              </Col>
            </Row>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

const BillingAside = () => {
  const [plan, setPlan] = useState('monthly');

  return (
    <Card className="h-100">
      <FalconCardHeader title="Billing" light={false} />
      <CardBody tag={Form} className="bg-light" onSubmit={e => e.preventDefault()}>
        <CustomInput
          type="select"
          id="plan"
          name="plan"
          className="mb-3"
          value={plan}
          onChange={({ target }) => setPlan(target.value)}
        >
          <option value="annual">Annual Plan</option>
          <option value="monthly">Monthly Plan</option>
        </CustomInput>
        <div className="d-flex justify-content-between fs--1 mb-1">
          <p className="mb-0">Due in 30 days</p>
          <span>$375.00</span>
        </div>
        <div className="d-flex justify-content-between fs--1 mb-1 text-success">
          <p className="mb-0">Annual saving</p>
          <span>$75.00/yr</span>
        </div>
        <hr />
        <h5 className="d-flex justify-content-between">
          <span>Due today</span>
          <span>$0.00</span>
        </h5>
        <p className="fs--1 text-600">
          Once you start your trial, you will have 30 days to use Falcon Premium for free. After 30 days you’ll be
          charged based on your selected plan.
        </p>
        <Button type="submit" color="primary" block>
          <FontAwesomeIcon icon="lock" className="mr-2" />
          Start free trial
        </Button>
        <div className="text-center mt-2">
          <small className="d-inline-block">
            By continuing, you are agreeing to our subscriber <Link to="#!">terms</Link> and will be charged at the end
            of the trial.
          </small>
        </div>
      </CardBody>
    </Card>
  );
};

const Billing = () => {
  return (
    <ContentWithAsideLayout
      banner={<BillingBanner />}
      aside={<BillingAside />}
      footer={<FaqCol />}
      isStickyAside={false}
    >
      <BillingContent />
    </ContentWithAsideLayout>
  );
};

export default Billing;
