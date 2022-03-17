import React, { Fragment, useContext } from 'react';
import PostCreateForm from './PostCreateForm';
import FeedCard from './FeedCard';
import { isIterableArray } from '../../helpers/utils';
import { FeedContext } from '../../context/Context';

const FeedContent = () => {
  const { feeds } = useContext(FeedContext);

  return (
    <Fragment>
      <PostCreateForm />
      {isIterableArray(feeds) && feeds.map(feed => <FeedCard {...feed} key={feed.id} className="mb-3" />)}
    </Fragment>
  );
};

export default FeedContent;
