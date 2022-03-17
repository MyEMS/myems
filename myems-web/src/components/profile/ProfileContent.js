import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Card, CardBody, Row, Col } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import Notification from '../notification/Notification';
import ProfileIntro from './ProfileIntro';
import Association from '../association/Association';
import LightBoxGallery from '../common/LightBoxGallery';

import { activities } from '../../data/notification/notification';
import associations from '../../data/association/associations';
import gallery from '../../data/profile/gallery';

const Associations = () => (
  <Card className="mb-3">
    <FalconCardHeader title="Associations">
      <Link to="/pages/associations" className="text-sans-serif">
        All Associations
      </Link>
    </FalconCardHeader>
    <CardBody className="fs--1">
      <Row>
        {associations.slice(0, 4).map((association, index) => (
          <Col sm={6} className="mb-3" key={index}>
            <Association {...association} />
          </Col>
        ))}
      </Row>
    </CardBody>
  </Card>
);

export const ActivityLog = ({ items = 5 }) => {
  const activityLog = activities.slice(0, items);

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Activity log">
        <Link to="/pages/activity" className="text-sans-serif">
          All logs
        </Link>
      </FalconCardHeader>

      <CardBody className="fs--1 p-0">
        {activityLog.map((activity, index) => {
          const roundedClass = activityLog.length === index + 1 ? 'rounded-top-0' : 'rounded-0';
          return (
            <Notification
              {...activity}
              key={index}
              className={`border-x-0 border-bottom-0 border-300 ${roundedClass}`}
            />
          );
        })}
      </CardBody>
    </Card>
  );
};

const GalleryItem = ({ index, gallery, onClick }) => (
  <img
    className="rounded w-100 cursor-pointer"
    src={gallery[index]}
    alt=""
    onClick={() => {
      onClick(index);
    }}
  />
);

GalleryItem.propTypes = {
  index: PropTypes.number.isRequired,
  gallery: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired
};

const Photos = ({ className }) => (
  <LightBoxGallery images={gallery}>
    {openImgIndex => (
      <Card className={className}>
        <FalconCardHeader title="Photos" />
        <CardBody>
          <Row noGutters className="m-n1">
            <Col xs={6} className="p-1">
              <GalleryItem index={0} gallery={gallery} onClick={openImgIndex} />
            </Col>
            <Col xs={6} className="p-1">
              <GalleryItem index={1} gallery={gallery} onClick={openImgIndex} />
            </Col>
            <Col xs={4} className="p-1">
              <GalleryItem index={2} gallery={gallery} onClick={openImgIndex} />
            </Col>
            <Col xs={4} className="p-1">
              <GalleryItem index={3} gallery={gallery} onClick={openImgIndex} />
            </Col>
            <Col xs={4} className="p-1">
              <GalleryItem index={4} gallery={gallery} onClick={openImgIndex} />
            </Col>
          </Row>
        </CardBody>
      </Card>
    )}
  </LightBoxGallery>
);

const ProfileContent = () => {
  return (
    <Fragment>
      <ProfileIntro />
      <Associations />
      <ActivityLog />
      <Photos className="mb-3 mb-lg-0" />
    </Fragment>
  );
};

export default ProfileContent;
