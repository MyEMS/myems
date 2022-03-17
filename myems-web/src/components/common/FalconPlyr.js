import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import 'plyr/dist/plyr.css';
import Plyr from 'plyr';

const FalconPlyr = ({ type, videoId }) => {
  const plyrRef = useRef();

  useEffect(() => {
    new Plyr(plyrRef.current);
  }, []);

  switch (type) {
    case 'youtube':
      return (
        <div className="position-relative">
          <div className="plyr__video-embed" ref={plyrRef}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}?origin=https://plyr.io&amp;iv_load_policy=3&amp;modestbranding=1&amp;playsinline=1&amp;showinfo=0&amp;rel=0&amp;enablejsapi=1`}
              allowFullScreen
              allow="autoplay"
              title={videoId}
            />
          </div>
        </div>
      );
    case 'vimeo':
      return (
        <div className="plyr__video-embed" ref={plyrRef}>
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?loop=false&amp;byline=false&amp;portrait=false&amp;title=false&amp;speed=true&amp;transparent=0&amp;gesture=media`}
            allowFullScreen
            allow="autoplay"
            title={videoId}
          />
        </div>
      );
    default:
      return null;
  }
};

FalconPlyr.propTypes = {
  videoId: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['youtube', 'vimeo']).isRequired
};

export default FalconPlyr;
