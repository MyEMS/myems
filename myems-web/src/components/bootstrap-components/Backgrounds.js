import React, { Fragment } from 'react';
import { Card, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import Background from '../common/Background';
import FalconEditor from '../common/FalconEditor';

import gallery2 from '../../assets/img/gallery/2.jpg';
import beachMp4 from '../../assets/video/beach/beach.mp4';
import beachWebm from '../../assets/video/beach/beach.webm';
import beachImage from '../../assets/video/beach/beach.jpg';

const imageCode = `<div className="position-relative py-6 py-lg-8">
  <Background image={gallery2} overlay="1" className="rounded-soft" />
  <div className="position-relative text-center">
    <h4 className="text-white">Image Background</h4>
  </div>
</div>`;

const videoCode = `<div className="position-relative">
  <Background video={[ beachMp4, beachWebm]} image={ beachImage } overlay="2" className="rounded-soft" />
  <div className="position-relative vh-75 d-flex flex-center">
    <h4 className="text-white">Video Background</h4>
  </div>
</div>`;

const Backgrounds = () => (
  <Fragment>
    <PageHeader
      title="Background"
      description="These modular elements can be readily used and customized in every layout across pages."
      className="mb-3"
    />
    <Card className="mb-3">
      <FalconCardHeader title="Image Background" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={imageCode} scope={{ Background, gallery2 }} language="jsx" />
      </CardBody>
    </Card>
    <Card>
      <FalconCardHeader title="Image Background" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={videoCode} scope={{ Background, beachMp4, beachWebm, beachImage }} language="jsx" />
      </CardBody>
    </Card>
  </Fragment>
);

export default Backgrounds;
