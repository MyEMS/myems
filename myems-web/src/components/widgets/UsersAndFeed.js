import React from 'react';
import WidgetsSectionTitle from './WidgetsSectionTitle';
import { Row, Col } from 'reactstrap';
import FeedInterest from '../feed/FeedInterest';
import Notifications from '../page/Notifications';
import Associations from '../page/Associations';
import InvitePeople from '../page/InvitePeople';
import People from '../page/People';
import FalconCardFooterLink from '../common/FalconCardFooterLink';
import FeedCard from '../feed/FeedCard';
import FeedProvider from '../feed/FeedProvider';
import rawFeeds from '../../data/feed/feeds';
import AddToFeed from '../feed/AddToFeed';
import ActiveUsers from '../dashboard-alt/ActiveUsers';
import users from '../../data/dashboard/users';
import ProfileBanner from '../profile/ProfileBanner';
import { EventDetailBanner } from '../page/EventDetail';
import { ActivityLog } from '../profile/ProfileContent';

const UsersAndFeed = () => {
  const VideoPostContent = rawFeeds.find(feed => {
    return Object.keys(feed.content).includes('video');
  });
  const GalleryPostContent = rawFeeds.find(feed => {
    return Object.keys(feed.content).includes('gallery');
  });

  return (
    <>
      <WidgetsSectionTitle
        icon="user-friends"
        title="Users & Feed"
        subtitle="You can easily display your profile related content with Falcon's special cards."
        transform="shrink-3"
      />
      <Row noGutters className="my-3">
        <Col lg={6} className="pr-lg-2 mb-3 mb-lg-0">
          <Notifications items={4}>
            <FalconCardFooterLink title="All Notifications" to="pages/notifications" />
          </Notifications>
        </Col>
        <Col lg={6} className="pl-lg-2 ">
          <FeedInterest className="h-100" />
        </Col>
      </Row>
      <Row noGutters>
        <Col lg={7} className="pr-lg-2">
          <Associations />
          <People peoples={6} className="col-md-4 col-6 mb-2" />
        </Col>
        <Col lg={5} className="pl-lg-2 mt-3 mt-lg-0">
          <InvitePeople
            inputCol={12}
            btnCol={12}
            className="h-100"
            brClass="d-none"
            titleClass="fs-2"
            footerTitleClass="fs-1"
            isInputAutoFocus={false}
          />
        </Col>
      </Row>
      <Row noGutters className="my-3">
        <Col lg={8} className="pr-lg-2">
          <FeedProvider>
            <Row noGutters className="h-100">
              <Col xs={12} className="mb-3">
                <FeedCard {...VideoPostContent} className="h-100" />
              </Col>
              <Col xs={12} className="mb-3 mb-lg-0">
                <FeedCard {...GalleryPostContent} className="h-100" />
              </Col>
            </Row>
          </FeedProvider>
        </Col>
        <Col lg={4} className="pl-lg-2">
          <ActivityLog items={7} />
          <AddToFeed peoples={8} />
          <ActiveUsers users={users} />
        </Col>
      </Row>
      <ProfileBanner />
      <EventDetailBanner />
    </>
  );
};

export default UsersAndFeed;
