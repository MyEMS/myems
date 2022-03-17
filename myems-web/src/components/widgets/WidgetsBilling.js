import React, { useState } from 'react';
import { Card, CardBody, CustomInput, Button, Form } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

const WidgetsBilling = () => {
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

export default WidgetsBilling;
