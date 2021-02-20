import React, { Fragment } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import beachImage from '../../assets/video/beach/beach.jpg';
import gallery2 from '../../assets/img/generic/2.jpg';
import gallery3 from '../../assets/img/generic/3.jpg';

const items = [
  {
    src: beachImage,
    altText: 'Slide 1',
    caption: 'Slide 1'
  },
  {
    src: gallery2,
    altText: 'Slide 2',
    caption: 'Slide 2'
  },
  {
    src: gallery3,
    altText: 'Slide 3',
    caption: 'Slide 3'
  }
];

const CarouselExample = () => {
  const carouselExample = `function carouselExample (){
    const [activeIndex, setActiveIndex] = useState(0);
    const [animating, setAnimating] = useState(false);

  const next = () => {
    if (animating) return;
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    setActiveIndex(nextIndex);
  };

  const previous = () => {
    if (animating) return;
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    setActiveIndex(nextIndex);
  };

  const goToIndex = newIndex => {
    if (animating) return;
    setActiveIndex(newIndex);
  };

  const slides = items.map(item => {
    return (
      <CarouselItem onExiting={() => setAnimating(true)} onExited={() => setAnimating(false)} key={item.src}>
        <img src={item.src} alt={item.altText} className='img-fluid'/>
        <CarouselCaption captionText={item.caption} captionHeader={item.caption} />
      </CarouselItem>
    );
  });
  return (
    <Carousel
      activeIndex={activeIndex}
      next={next}
      previous={previous}
    >
      <CarouselIndicators items={items} activeIndex={activeIndex} onClickHandler={goToIndex} />
      {slides}
      <CarouselControl direction="prev" directionText="Previous" onClickHandler={previous} />
      <CarouselControl direction="next" directionText="Next" onClickHandler={next} />
    </Carousel>
  );
  }`;

  return (
    <Fragment>
      <PageHeader
        title="Carousel"
        description="A slideshow component for cycling through elements—images or slides of text—like a carousel."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://reactstrap.github.io/components/carousel/"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          Carousel on reactstrap
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>

      <Card>
        <FalconCardHeader title="Example" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={carouselExample} scope={{ items }} />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default CarouselExample;
