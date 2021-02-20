import React, { Fragment } from 'react';
import { Button, Card, CardBody, Col, Row } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconPlyr from '../common/FalconPlyr';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';

const falconPlyrYoutubeCode = `<div className="rounded-soft overflow-hidden position-relative">
  <FalconPlyr videoId="bTqVqk7FSmY" type="youtube" />
</div>`;

const falconPlyrVimeoCode = `<div className="rounded-soft overflow-hidden position-relative">
  <FalconPlyr videoId="76979871" type="vimeo" />
</div>`;

const falconPlyrPropsCode = `FalconPlyr.propTypes = {
  videoId: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['youtube', 'vimeo']).isRequired
};`;

const Plyr = () => {
  return (
    <Fragment>
      <PageHeader
        title="Falcon Player"
        description="A simple, lightweight, accessible and customizable HTML5, YouTube and Vimeo media player that supports modern browsers."
        className="mb-3"
      >
        <Button tag="a" href="https://github.com/sampotts/plyr" target="_blank" color="link" size="sm" className="pl-0">
          Plyr Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Row>
        <Col lg={6}>
          <Card className="mb-3">
            <FalconCardHeader title="Youtube" />
            <CardBody>
              <FalconEditor code={falconPlyrYoutubeCode} scope={{ FalconPlyr }} language="jsx" />
            </CardBody>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="mb-3">
            <FalconCardHeader title="Vimeo" />
            <CardBody>
              <FalconEditor code={falconPlyrVimeoCode} scope={{ FalconPlyr }} language="jsx" />
            </CardBody>
          </Card>
        </Col>
        <Col xs={12}>
          <Card>
            <FalconCardHeader title="Default Properties" />
            <CardBody>
              <FalconEditor code={falconPlyrPropsCode} scope={{ FalconPlyr }} language="jsx" hidePreview />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Plyr;
