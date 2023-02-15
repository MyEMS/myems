import React, { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, Col, CustomInput, Label, Row } from 'reactstrap';
import PricingCard from './PricingCard';
import FaqCollapse from '../faq/FaqCollapse';
import PageHeader from '../common/PageHeader';
import { isIterableArray } from '../../helpers/utils';
import pricing from '../../data/pricing/pricing';

const Pricing = () => {
  // State
  const [isYearly, setIsYearly] = useState(true);

  return (
    <Fragment>
      <PageHeader
        title="For teams of all sizes, in the cloud"
        titleTag="h2"
        description="Get the power, control, and customization you need to manage your team’s and organization’s projects."
        className="mb-3"
        col={{ lg: 9 }}
      >
        <Button tag={Link} color="link" size="sm" className="pl-0" to="#!">
          Have questions? Chat with us
        </Button>
      </PageHeader>

      <Card className="mb-3">
        <CardBody>
          <Row noGutters>
            <Col xs={12} className="mb-3">
              <Row className="justify-content-center justify-content-sm-between">
                <Col sm="auto" className="text-center">
                  <h5 className="d-inline-block">Build Annually</h5>
                  {isYearly && <span className="badge badge-soft-success badge-pill ml-2">Save 25%</span>}
                </Col>
                <Col sm="auto" className="d-flex flex-center fs--1 mt-1 mt-sm-0">
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
                </Col>
              </Row>
            </Col>

            {isIterableArray(pricing) &&
              pricing.map((pricingItem, index) => (
                <Col lg={4} className={`${index !== 1 ? 'border-lg-y' : 'border-y'}`} key={index}>
                  <PricingCard {...pricingItem} isYearly={isYearly} />
                </Col>
              ))}

            <Col xs={12} className="text-center">
              <h5 className="mt-5">Looking for personal or small team task management?</h5>
              <p className="fs-1">
                Try the <Link to="#">basic version</Link> of Falcon
              </p>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <FaqCollapse />
    </Fragment>
  );
};

export default Pricing;
