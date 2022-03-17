import React, { Fragment } from 'react';
import PageHeader from '../common/PageHeader';
import { Button, Card, CardBody, CardHeader, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import FalconEditor from '../common/FalconEditor';
import LottieAnim from 'react-lottie';
import animationData from './lottie/warning-light.json';
import checkData from './lottie/check-primary-light.json';
import heartData from './lottie/heart.json';

const LottieCode = `function LottieExample() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return  <LottieAnim options={defaultOptions} style={{ width: '120px', height:'120px'  }} />
}`;
const lottieCheckCode = `function lottieCheckExample() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: checkData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return  <LottieAnim options={defaultOptions} style={{ width: '130px', height:'120px'  }} />
}`;
const lottieHeartCode = `function lottieHeartExample() {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: heartData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return  <LottieAnim options={defaultOptions} style={{ width: '100px',height:'120px'  }} />
}`;

const Lottie = () => {
  return (
    <Fragment>
      <PageHeader
        title="Lottie"
        description="Render After Effects animations natively on Web, Android, and iOS, and React Native. You can update colors, animation duration, and other stuff from this <a href='https://lottiefiles.com/editor' target='_blank' >Lottie Editor</a> excellent editor."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://github.com/chenqingspring/react-lottie#readme"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          React Lottie Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card>
        <CardHeader className="bg-light">
          <h4 className="mb-0">Example</h4>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={4}>
              <FalconEditor code={LottieCode} scope={{ LottieAnim, animationData }} language="jsx" />
            </Col>
            <Col lg={4}>
              <FalconEditor code={lottieCheckCode} scope={{ LottieAnim, checkData }} language="jsx" />
            </Col>
            <Col lg={4}>
              <FalconEditor code={lottieHeartCode} scope={{ LottieAnim, heartData }} language="jsx" />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Lottie;
