import React, { Fragment, useContext } from 'react';
import { Row, Col, Button } from 'reactstrap';

import Lottie from 'react-lottie';
import animationData from './lottie/celebration.json';
import { AuthWizardContext } from '../../../context/Context';

const Success = () => {
  const { setStep, setUser } = useContext(AuthWizardContext);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  const emptyData = () => {
    setStep(1);
    setUser({});
  };

  return (
    <Fragment>
      <Row>
        <Col className="text-center">
          <div className="wizard-lottie-wrapper">
            <div className="wizard-lottie mx-auto">
              <Lottie options={defaultOptions} />
            </div>
          </div>
          <h4 className="mb-1">Your account is all set!</h4>
          <p className="fs-0">Now you can access to your account</p>
          <Button color="primary" className="px-5 my-3 text-white" onClick={emptyData}>
            Start Over
          </Button>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Success;
