import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import LikeComentShareCount from './LikeComentShareCount';
import IconStatus from './IconStatus';
import { CardFooter, Form, Input } from 'reactstrap';
import Flex from '../common/Flex';
import Avatar from '../common/Avatar';
import Comments from './Comments';
import { FeedContext } from '../../context/Context';
import { isIterableArray } from '../../helpers/utils';
import uuid from 'uuid/v1';
import av3 from '../../assets/img/team/3.jpg';

const FeedCardFooter = ({ id, countLCS, comments, otherComments }) => {
  const { feeds, feedDispatch } = useContext(FeedContext);
  const [comment, setComment] = useState('');

  const submitComment = e => {
    e.preventDefault();

    const newComment = {
      id: uuid(),
      avatarSrc: av3,
      name: 'Rebecca Marry',
      content: comment,
      postTime: '1m'
    };

    const newFeed = () => {
      const targetedFeed = feeds.find(feed => feed.id === id);
      targetedFeed.footer = { ...targetedFeed.footer, comments: [newComment, ...comments] };
      return targetedFeed;
    };

    feedDispatch({ type: 'EDIT', payload: newFeed(), id });
    setComment('');
  };

  return (
    <CardFooter className="bg-light pt-0">
      <LikeComentShareCount countLCS={countLCS} comments={comments} />
      <IconStatus id={id} />
      <Flex tag={Form} align="center" className="border-top border-200 pt-3" onSubmit={submitComment}>
        <Avatar src={av3} size="xl" />
        <Input
          className="rounded-capsule ml-2 fs--1"
          placeholder="Write a comment..."
          value={comment}
          onChange={({ target }) => setComment(target.value)}
        />
      </Flex>
      {isIterableArray(comments) && <Comments comments={comments} loadComment={otherComments} />}
    </CardFooter>
  );
};

FeedCardFooter.propTypes = {
  id: PropTypes.string.isRequired,
  countLCS: PropTypes.object.isRequired,
  comments: PropTypes.array,
  otherComments: PropTypes.string
};

FeedCardFooter.defaultProps = {
  countLCS: { like: 0 },
  comments: []
};

export default FeedCardFooter;
