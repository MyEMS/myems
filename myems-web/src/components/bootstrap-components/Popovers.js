import React, { Fragment } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const popoversExampleCode = `function popoversExample() {
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);
  const [isOpenTop, setIsOpenTop] = useState(false);
  const [isOpenBottom, setIsOpenBottom] = useState(false);
  
  return(
    <Fragment>
      <Button id="Popover3" className="mr-2" type="button">
        Popover on top
      </Button>
      <Popover 
        placement="top" 
        isOpen={isOpenTop} 
        target="Popover3" 
        toggle={() => setIsOpenTop(!isOpenTop)}
      >
        <PopoverHeader>Popover Title</PopoverHeader>
        <PopoverBody>Vivamus sagittis lacus vel augue laoreet rutrum faucibus.</PopoverBody>
      </Popover>

      <Button id="Popover4" className="mr-2" type="button">
        Popover on Bottom
      </Button>
      <Popover
        placement="bottom"
        isOpen={isOpenBottom}
        target="Popover4"
        toggle={() => setIsOpenBottom(!isOpenBottom)}
      >
        <PopoverHeader>Popover Title</PopoverHeader>
        <PopoverBody>Vivamus sagittis lacus vel augue laoreet rutrum faucibus.</PopoverBody>
      </Popover>
      
      <Button id="Popover1" className="mr-2" type="button">
        Popover on left
      </Button>
      
      <Popover 
        placement="left" 
        isOpen={isOpenLeft} 
        target="Popover1" 
        toggle={() => setIsOpenLeft(!isOpenLeft)}
      >
        <PopoverHeader>Popover Title</PopoverHeader>
        <PopoverBody>Vivamus sagittis lacus vel augue laoreet rutrum faucibus.</PopoverBody>
      </Popover>

      <Button id="Popover2" type="button">
        Popover on right
      </Button>
      <Popover 
        placement="right" 
        isOpen={isOpenRight} 
        target="Popover2" 
        toggle={() => setIsOpenRight(!isOpenRight)}
      >
        <PopoverHeader>Popover Title</PopoverHeader>
        <PopoverBody>Vivamus sagittis lacus vel augue laoreet rutrum faucibus.</PopoverBody>
      </Popover>
     </Fragment>
  );
}`;

const propertiesCode = `Popover.propTypes = {
  // space separated list of triggers (e.g. "click hover focus")
  trigger: PropTypes.string,
  // boolean to control the state of the popover
  isOpen:  PropTypes.bool,
  // callback for toggling isOpen in the controlling component
  toggle:  PropTypes.func,
  // boundaries for popper, can be scrollParent, window, viewport, or any DOM element
  boundariesElement: PropTypes.oneOfType([PropTypes.string, DOMElement]),
  target:  PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    DOMElement, // instanceof Element (https://developer.mozilla.org/en-US/docs/Web/API/Element)
  ]).isRequired,
  // Where to inject the popper DOM node, default to body
  container: PropTypes.oneOfType([PropTypes.string, PropTypes.func, DOMElement]),
  className: PropTypes.string,
  // Apply class to the inner-popover
  innerClassName: PropTypes.string,
  disabled: PropTypes.bool,
  hideArrow: PropTypes.bool,
  placementPrefix: PropTypes.string,
  delay: PropTypes.oneOfType([
    PropTypes.shape({ show: PropTypes.number, hide: PropTypes.number }),
    PropTypes.number,
  ]),
  placement: PropTypes.oneOf([
    'auto',
    'auto-start',
    'auto-end',
    'top',
    'top-start',
    'top-end',
    'right',
    'right-start',
    'right-end',
    'bottom',
    'bottom-start',
    'bottom-end',
    'left',
    'left-start',
    'left-end',
  ]),
  // Custom modifiers that are passed to Popper.js, see https://popper.js.org/popper-documentation.html#modifiers
  modifiers: PropTypes.object,
  offset: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),

  // Whether to show/hide the popover with a fade effect
  // (default: true)
  fade: PropTypes.bool,

  // Whether to flip the direction of the popover if too close to
  // the container edge
  // (default: true)
  flip: PropTypes.bool,
}`;

const Popovers = () => {
  return (
    <Fragment>
      <PageHeader
        title="Popovers"
        description="Documentation and examples for showing pagination to indicate a series of related content exists across multiple pages."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://reactstrap.github.io/components/buttons"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          Popovers on reactstrap
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card className="mb-3">
        <FalconCardHeader title="Examples" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={popoversExampleCode} language="jsx" />
        </CardBody>
      </Card>
      <Card>
        <FalconCardHeader title="Properties" light={false} />
        <CardBody className="bg-light">
          <code className="bg-dark d-block p-2">
            <pre className="text-300">{propertiesCode}</pre>
          </code>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Popovers;
