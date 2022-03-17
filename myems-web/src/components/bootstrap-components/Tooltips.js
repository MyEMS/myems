import React, { Fragment } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const tooltipsExampleCode = `function tooltipsExampleCode() {
  const [isOpenLeft, setIsOpenLeft] = useState(false);
  const [isOpenRight, setIsOpenRight] = useState(false);
  const [isOpenTop, setIsOpenTop] = useState(false);
  const [isOpenBottom, setIsOpenBottom] = useState(false);

  return (
    <Fragment>
      <Button size="sm" color="secondary" className="m-1" id="pop3">
         Tooltip on top
      </Button>
      <Tooltip
        placement="top"
        isOpen={isOpenTop}
        target="pop3"
        toggle={() => setIsOpenTop(!isOpenTop)}>
         Tooltip on top
      </Tooltip>

      <Button size="sm" color="secondary" className="m-1" id="pop4">
        Tooltip on bottom
      </Button>
      <Tooltip
        placement="bottom"
        isOpen={isOpenBottom}
        target="pop4"
        toggle={() => setIsOpenBottom(!isOpenBottom)}
        container='.content'
      >
        Tooltip on bottom
      </Tooltip>

      <Button size="sm" color="secondary" className="m-1" id="pop1">
         Tooltip on left
      </Button>
      <Tooltip
        placement="left"
        isOpen={isOpenLeft}
        target="pop1"
        toggle={() => setIsOpenLeft(!isOpenLeft)}
      >
         Tooltip on left
      </Tooltip>

      <Button size="sm" color="secondary" className="m-1" id="pop2">
       Tooltip on right
      </Button>
      <Tooltip
        placement="right"
        isOpen={isOpenRight}
        target="pop2"
        toggle={() => setIsOpenRight(!isOpenRight)}
      >
        Tooltip on right
      </Tooltip>
    </Fragment>
  );
}`;

const propertyCode = `Tooltip.propTypes = {
  // space separated list of triggers (e.g. "click hover focus")
  trigger: PropTypes.string,
  // boundaries for popper, can be scrollParent, window, viewport, or any DOM element
  boundariesElement: PropTypes.oneOfType([PropTypes.string, DOMElement]),
  // boolean to control the state of the tooltip
  isOpen: PropTypes.bool,
  hideArrow: PropTypes.bool,
  // callback for toggling isOpen in the controlling component. It will receive an object with info about the event that triggered it
  toggle: PropTypes.func,
  // target element or element ID, popover is attached to this element
  target:  PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
    DOMElement, // instanceof Element (https://developer.mozilla.org/en-US/docs/Web/API/Element)
  ]).isRequired,
  // Where to inject the popper DOM node, default to body
  container: PropTypes.oneOfType([PropTypes.string, PropTypes.func, DOMElement]),
  // optionally override show/hide delays - default { show: 0, hide: 250 }
  delay: PropTypes.oneOfType([
    PropTypes.shape({ show: PropTypes.number, hide: PropTypes.number }),
    PropTypes.number
  ]),
  className: PropTypes.string,
  // Apply class to the inner-tooltip
  innerClassName: PropTypes.string,
  // Apply class to the arrow-tooltip ('arrow' by default)
  arrowClassName: PropTypes.string,
  // optionally hide tooltip when hovering over tooltip content - default true
  autohide: PropTypes.bool,
  // convenience attachments for popover
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
  // Custom ref handler that will be assigned to the "ref" of the <div> wrapping the tooltip elements
  innerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.string,
    PropTypes.object
  ]),

  // Whether to show/hide the popover with a fade effect
  // (default: true)
  fade: PropTypes.bool,

  // Whether to flip the direction of the popover if too close to
  // the container edge
  // (default: true)
  flip: PropTypes.bool,
}`;

const Tooltips = () => {
  return (
    <Fragment>
      <PageHeader
        title="Tooltips"
        description="Documentation and examples for adding Falcon tooltips with CSS and JavaScript using CSS3 for animations and data-attributes for local title storage."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://reactstrap.github.io/components/tooltips"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          Tooltips on reactstrap
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card className="mb-3">
        <FalconCardHeader title="Example" light={false} />
        <CardBody className="bg-light">
          <FalconEditor code={tooltipsExampleCode} language="jsx" />
        </CardBody>
      </Card>
      <Card>
        <FalconCardHeader title="Property" light={false} />
        <CardBody className="bg-light">
          <code className="bg-dark d-block p-2">
            <pre className="text-300">{propertyCode}</pre>
          </code>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Tooltips;
