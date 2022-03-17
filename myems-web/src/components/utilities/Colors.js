import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Row, Col, Card, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';

const Colors = () => (
  <Fragment>
    <PageHeader
      title="Colors"
      description="Convey meaning through color with a handful of color utility classes. Includes support for styling links with hover states, too."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/utilities/colors/"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Colors on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card className="mb-3">
      <FalconCardHeader title="Theme colors" light={false} />
      <CardBody className="bg-light">
        <Row noGutters>
          {['primary', 'secondary', 'success', 'info', 'warning', 'danger', 'light', 'dark'].map((color, index) => (
            <Col xs={6} sm={4} lg={3} key={index}>
              <div className={`p-3 bg-${color}`} style={{ height: '180px' }}>
                <code className={color === 'light' ? 'text-black' : 'text-white'}>.text-{color}</code>
                <br />
                <code className={color === 'light' ? 'text-black' : 'text-white'}>.bg-{color}</code>
              </div>
            </Col>
          ))}
        </Row>
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Gray shades" light={false} />
      <CardBody className="bg-light">
        <Row noGutters>
          {['black', '1100', '1000', '900', '800', '700', '600', '500', '400', '300', '200', '100', 'white'].map(
            (color, index) => (
              <Col xs={6} sm={4} lg={3} key={index}>
                <div className={`p-3 bg-${color}`} style={{ height: '180px' }}>
                  <code className={color <= 400 || color === 'white' ? 'text-black' : 'text-white'}>.text-{color}</code>
                  <br />
                  <code className={color <= 400 || color === 'white' ? 'text-black' : 'text-white'}>.bg-{color}</code>
                </div>
              </Col>
            )
          )}
        </Row>
      </CardBody>
    </Card>
  </Fragment>
);

export default Colors;
