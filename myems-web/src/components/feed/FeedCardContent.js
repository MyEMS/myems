import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import createMarkup from '../../helpers/createMarkup';
import FeedImageLightbox from './FeedImageLightbox';
import FeedEvent from './FeedEvent';
import FeedUrl from './FeedUrl';
import FalconPlyr from '../common/FalconPlyr';
import { CardBody } from 'reactstrap';
import FalconLightBox from '../common/FalconLightBox';

const FeedCardContent = ({ status, imgSrc, gallery, feedEvent, url, video }) => {
  return (
    <CardBody className={classNames({ 'p-0': !!feedEvent })}>
      {!!status && <p dangerouslySetInnerHTML={createMarkup(status)} />}
      {!!imgSrc && (
        <FalconLightBox imgSrc={imgSrc}>
          <img src={imgSrc} className="img-fluid rounded" alt="" />
        </FalconLightBox>
      )}
      {!!gallery && <FeedImageLightbox />}
      {!!feedEvent && <FeedEvent {...feedEvent} />}
      {!!url && <FeedUrl {...url} />}
      {!!video && (
        <div className="rounded-soft overflow-hidden position-relative">
          <FalconPlyr {...video} />
        </div>
      )}
    </CardBody>
  );
};

FeedCardContent.propTypes = {
  status: PropTypes.string,
  imgSrc: PropTypes.string,
  gallery: PropTypes.bool,
  feedEvent: PropTypes.object,
  url: PropTypes.object,
  video: PropTypes.object
};

export default FeedCardContent;
