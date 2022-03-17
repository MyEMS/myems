import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import { isIterableArray } from '../../helpers/utils';
import { FeedContext } from '../../context/Context';
import { Col, Row } from 'reactstrap';
import Flex from '../common/Flex';

import LikeInactive from '../../assets/img/illustrations/like-inactive.png';
import commentActive from '../../assets/img/illustrations/comment-active.png';
import shareActive from '../../assets/img/illustrations/share-active.png';
import shareInactive from '../../assets/img/illustrations/share-inactive.png';
import commentInActive from '../../assets/img/illustrations/comment-inactive.png';
import likeActive from '../../assets/img/illustrations/like-active.png';

const IconStatus = ({ id }) => {
  const { feeds, feedDispatch } = useContext(FeedContext);

  const [active, setActive] = useState(false);
  const targetedFeed = feeds.find(feed => feed.id === id);

  const toggleActive = () => {
    setActive(!active);
    const newFeed = () => {
      targetedFeed.footer.countLCS.like = active
        ? (targetedFeed.footer.countLCS.like -= 1)
        : (targetedFeed.footer.countLCS.like += 1);
      return targetedFeed;
    };

    feedDispatch({ type: 'EDIT', payload: newFeed(), id });
  };
  return (
    <Row noGutters className="font-weight-semi-bold text-center py-2 fs--1">
      <Col xs="auto">
        <Flex align="center" className="rounded text-700 mr-3 cursor-pointer" onClick={toggleActive}>
          <img src={active === true ? likeActive : LikeInactive} alt="" width="20" />
          <span className="ml-1">Like</span>
        </Flex>
      </Col>
      <Col xs="auto">
        <Flex align="center" className="rounded text-700 mr-3 cursor-pointer">
          <img
            src={isIterableArray(targetedFeed.footer.comments) ? commentActive : commentInActive}
            alt=""
            width="20"
          />
          <span className="ml-1">Comment</span>
        </Flex>
      </Col>
      <Col xs="auto">
        <Flex align="center" className="rounded text-700 mr-3 cursor-pointer">
          <img src={!!targetedFeed.footer.countLCS.share ? shareActive : shareInactive} alt="" width="20" />
          <span className="ml-1">Share</span>
        </Flex>
      </Col>
    </Row>
  );
};

IconStatus.propTypes = { id: PropTypes.string.isRequired };

export default IconStatus;
