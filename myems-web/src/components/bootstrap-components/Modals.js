import React, { Fragment } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import PageHeader from '../common/PageHeader';

const basicModal = `function basicModalExample () {
  const [collapseOne, collapseOneOpen] = useState(false);
  
  return (
    <Fragment>
      <Button color="primary" onClick={() => collapseOneOpen(!collapseOne)}>
        Launch demo modal
      </Button>
      <Modal isOpen={collapseOne} toggle={() => collapseOneOpen(!collapseOne)}>
        <ModalHeader>Modal title</ModalHeader>
        <ModalBody>
         Woohoo, you're reading this text in a modal!
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => collapseOneOpen(!collapseOne)}>
            Close
          </Button>
          <Button color="primary">Save changes</Button>
        </ModalFooter>
      </Modal>
    </Fragment>
  );
}`;

const properties = `Modal.propTypes = {
  // boolean to control the state of the popover
  isOpen:  PropTypes.bool,
  autoFocus: PropTypes.bool,
  // if modal should be centered vertically in viewport
  centered: PropTypes.bool,
  // corresponds to bootstrap's modal sizes, ie. 'lg' or 'sm'
  size: PropTypes.string,
  // callback for toggling isOpen in the controlling component
  toggle:  PropTypes.func,
  role: PropTypes.string, // defaults to "dialog"
  // used to reference the ID of the title element in the modal
  labelledBy: PropTypes.string,
  keyboard: PropTypes.bool,
  // control backdrop, see http://v4-alpha.getbootstrap.com/components/modal/#options
  backdrop: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(['static'])
  ]),
  // if body of modal should be scrollable when content is long
  scrollable: PropTypes.bool,
  // allows for a node/component to exist next to the modal (outside of it). Useful for external close buttons
  // external: PropTypes.node,
  // called on componentDidMount
  onEnter: PropTypes.func,
  // called on componentWillUnmount
  onExit: PropTypes.func,
  // called when done transitioning in
  onOpened: PropTypes.func,
  // called when done transitioning out
  onClosed: PropTypes.func,
  className: PropTypes.string,
  wrapClassName: PropTypes.string,
  modalClassName: PropTypes.string,
  backdropClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  // boolean to control whether the fade transition occurs (default: true)
  fade: PropTypes.bool,
  cssModule: PropTypes.object,
  // zIndex defaults to 1000.
  zIndex: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string,
  ]),
  // backdropTransition - controls backdrop transition
  // timeout is 150ms by default to match bootstrap
  // see Fade for more details
  backdropTransition: PropTypes.shape(Fade.propTypes),
  // modalTransition - controls modal transition
  // timeout is 300ms by default to match bootstrap
  // see Fade for more details
  modalTransition: PropTypes.shape(Fade.propTypes),
  innerRef: PropTypes.object,
  // if modal should be destructed/removed from DOM after closing
  unmountOnClose: PropTypes.bool // defaults to true
}`;

const Modals = () => (
  <Fragment>
    <PageHeader
      title="Modals"
      description="Use Bootstrap’s JavaScript modal plugin to add dialogs to your site for lightboxes, user notifications, or completely custom content."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/components/modals"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Modals on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card className="mb-3">
      <FalconCardHeader title="Modals" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={basicModal} language="jsx" />
      </CardBody>
    </Card>
    <Card>
      <FalconCardHeader title="Properties" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={properties} hidePreview />
      </CardBody>
    </Card>
  </Fragment>
);

export default Modals;
