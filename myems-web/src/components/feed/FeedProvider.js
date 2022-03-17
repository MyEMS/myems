import React, { useReducer } from 'react';
import { FeedContext } from '../../context/Context';
import { arrayReducer } from '../../reducers/arrayReducer';
import rawFeeds from '../../data/feed/feeds';

const FeedProvider = ({ children }) => {
  const [feeds, feedDispatch] = useReducer(arrayReducer, rawFeeds);

  return <FeedContext.Provider value={{ feeds, feedDispatch }}>{children}</FeedContext.Provider>;
};

export default FeedProvider;
