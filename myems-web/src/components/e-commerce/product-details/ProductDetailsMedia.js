import React, { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { isIterableArray } from '../../../helpers/utils';
import Slider from 'react-slick/lib';
import { Badge } from 'reactstrap';
import LightBoxGallery from '../../common/LightBoxGallery';

const sliderSettings = {
  infinite: true,
  speed: 500,
  slidesToShow: 1,
  slidesToScroll: 1
};

const ProductDetailsMedia = ({ files, isNew }) => {
  // For Slider
  let slider1;
  let slider2;
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  useEffect(() => {
    setNav1(slider1);
    setNav2(slider2);
  }, [slider1, slider2]);

  return (
    <LightBoxGallery images={files.map(file => file['src'] || file['base64'])}>
      {openImgIndex => (
        <div className="position-relative h-sm-100 overflow-hidden">
          {isIterableArray(files) && files.length === 1 && (
            <img
              className="img-fluid fit-cover w-sm-100 h-sm-100 rounded cursor-pointer"
              src={files[0]['src'] || files[0]['base64']}
              onClick={() => {
                openImgIndex(0);
              }}
              alt={files[0].path}
            />
          )}
          {isIterableArray(files) && files.length > 1 && (
            <Fragment>
              <Slider
                {...sliderSettings}
                asNavFor={nav2}
                ref={slider => (slider1 = slider)}
                className="slick-slider-arrow-inner"
              >
                {files.map((file, index) => (
                  <img
                    className="img-fluid fit-cover w-sm-100 h-sm-100 rounded rounded cursor-pointer"
                    src={file['src'] || file['base64']}
                    alt={file.path}
                    key={file.id}
                    onClick={() => {
                      openImgIndex(index);
                    }}
                  />
                ))}
              </Slider>
              <Slider
                asNavFor={nav1}
                ref={slider => (slider2 = slider)}
                slidesToShow={files.length > 5 ? 5 : files.length}
                swipeToSlide={true}
                focusOnSelect={true}
                className="slick-slider-arrow-inner mt-1 mr-n1 mb-n2"
              >
                {files.map(file => (
                  <div className="cursor-pointer pr-1 outline-none" key={file.id}>
                    <img
                      className="img-fluid fit-cover w-sm-100 h-sm-100 rounded"
                      src={file['src'] || file['base64']}
                      alt={file.path}
                    />
                  </div>
                ))}
              </Slider>
            </Fragment>
          )}
          {isNew && (
            <Badge color="success" pill className="position-absolute t-0 r-0 mr-2 mt-2 fs--2 z-index-2">
              New
            </Badge>
          )}
        </div>
      )}
    </LightBoxGallery>
  );
};

ProductDetailsMedia.propTypes = { value: PropTypes.any };

ProductDetailsMedia.defaultProps = { value: `ProductDetailsMedia` };

export default ProductDetailsMedia;
