import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Col, CustomInput, Label, Row } from 'reactstrap';
import Flex from '../common/Flex';
import FaqCol from '../faq/FaqCol';
import PricingCardAlt from './PricingCardAlt';
import { isIterableArray } from '../../helpers/utils';
import pricingAlt from '../../data/pricing/pricingAlt';

const FalconPricingAlt = () => {
  // State
  const [isYearly, setIsYearly] = useState(true);

  return (
    <Card className="mb-3">
      <CardBody>
        <Row className="justify-content-center">
          <Col xs={12} className="text-center mb-4">
            <div className="fs-1">Falcon Pricing</div>
            <h3 className="fs-2 fs-md-3">
              Free plan with all the basic features. <br className="d-none d-md-block" />
              Pro plan for advanced users.
            </h3>
            <Flex align="center" justify="center" className="fs--1">
              <Label className="mr-2 mb-0" htmlFor="customSwitch1">
                Monthly
              </Label>
              <CustomInput
                type="switch"
                id="customSwitch1"
                label="Yearly"
                checked={isYearly}
                onChange={() => setIsYearly(!isYearly)}
              />
            </Flex>
          </Col>
          <Col xs={12} lg={8}>
            <Row>
              {isIterableArray(pricingAlt) &&
                pricingAlt.map((pricingCard, index) => (
                  <Col xs={12} md key={index}>
                    <PricingCardAlt {...pricingCard} isYearly={isYearly} />
                  </Col>
                ))}
            </Row>
          </Col>
          <Col xs={12} className="text-center">
            <h5 className="mt-5">Looking for personal or small team task management?</h5>
            <p className="fs-1">
              Try the <Link to="#!">basic version</Link> of Falcon
            </p>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

const PricingAlt = () => {
  return (
    <Fragment>
      <FalconPricingAlt />
      <FaqCol />
    </Fragment>
  );
};

export default PricingAlt;
