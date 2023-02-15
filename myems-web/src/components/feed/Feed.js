import React from 'react';
import ContentWithAsideLayout from '../../layouts/ContentWithAsideLayout';
import FeedContent from './FeedContent';
import FeedSideBar from './FeedSideBar';
import FeedProvider from './FeedProvider';

const Feed = () => (
  <FeedProvider>
    <ContentWithAsideLayout aside={<FeedSideBar />} isStickyAside={false}>
      <FeedContent />
    </ContentWithAsideLayout>
  </FeedProvider>
);

export default Feed;
