import React from 'react';
import PropTypes from 'prop-types';
import isNull from 'lodash/isNull';
import Lightbox from 'react-image-lightbox';

const LightBoxGallery = ({ images, children }) => {
  const [imgIndex, setImgIndex] = React.useState(null);

  return (
    <div>
      {children(setImgIndex)}
      {!isNull(imgIndex) && (
        <Lightbox
          mainSrc={images[imgIndex]}
          nextSrc={images[(imgIndex + 1) % images.length]}
          prevSrc={images[(imgIndex + images.length - 1) % images.length]}
          onCloseRequest={() => setImgIndex(null)}
          onMovePrevRequest={() => setImgIndex((imgIndex + images.length - 1) % images.length)}
          onMoveNextRequest={() => setImgIndex((imgIndex + 1) % images.length)}
          reactModalStyle={{ overlay: { zIndex: 999999 } }}
        />
      )}
    </div>
  );
};

LightBoxGallery.propTypes = {
  images: PropTypes.array.isRequired,
  children: PropTypes.func.isRequired
};

export default LightBoxGallery;
