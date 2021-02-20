import React from 'react';
import { CardBody, Row } from 'reactstrap';
import ProfileBannerIntro from '../profile/ProfileBannerIntro';
import ProfileBannerHighlights from '../profile/ProfileBannerHighlights';

const ProfileBannerBody = props => {
  return (
    <CardBody>
      <Row>
        <ProfileBannerIntro {...props} />
        <ProfileBannerHighlights {...props} />
      </Row>
    </CardBody>
  );
};

export default ProfileBannerBody;
