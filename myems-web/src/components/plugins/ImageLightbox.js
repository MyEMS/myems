import React, { Fragment } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../common/FalconCardHeader';
import LightBoxGallery from '../common/LightBoxGallery';
import img1 from '../../assets/img/generic/4.jpg';
import img2 from '../../assets/img/generic/5.jpg';
import img3 from '../../assets/img/gallery/4.jpg';
import img4 from '../../assets/img/gallery/5.jpg';
import FalconEditor from '../common/FalconEditor';
import PageHeader from '../common/PageHeader';

const lightBoxGalleryCode = `<LightBoxGallery images={images}>
  {openImgIndex => (
    <Row noGutters className="m-n1">
      {images.map((src, index) => (
        <Col xs={6} className="p-1" key={index}>
        <img
          className="rounded w-100 cursor-pointer"
          src={images[index]}
          alt=""
          onClick={() => {
            openImgIndex(index);
          }}
        />
      </Col>
      ))}
    </Row>
  )}
</LightBoxGallery>`;

const ImageLightbox = () => {
  const images = [img1, img2, img3, img4];

  return (
    <Fragment>
      <PageHeader
        title="React Image Lightbox"
        description="A flexible lightbox component for displaying images in a React project."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://frontend-collective.github.io/react-image-lightbox"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          React Image Lightbox Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card>
        <FalconCardHeader title="Example" />
        <CardBody>
          <FalconEditor code={lightBoxGalleryCode} scope={{ LightBoxGallery, images }} language="jsx" />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default ImageLightbox;
