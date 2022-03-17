import React, { Fragment, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardFooter, Col, Form, Input, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import ButtonIcon from '../common/ButtonIcon';
import { toast } from 'react-toastify';

import gifts from '../../assets/img/illustrations/gifts.png';
import logoGmail from '../../assets/img/logos/gmail.png';

const InvitedLinkModal = ({ isOpen, toggleModal }) => {
  const inviteLinkRef = useRef(null);

  useEffect(() => {
    setImmediate(() => {
      inviteLinkRef.current && inviteLinkRef.current.select();
    });
  }, [isOpen, inviteLinkRef]);

  return (
    <Modal isOpen={isOpen} toggle={toggleModal} contentClassName="overflow-hidden" centered>
      <ModalHeader>Your personal referral link</ModalHeader>
      <ModalBody className="bg-light p-4">
        <Form>
          <Input bsSize="sm" value="https://falcon.com/invited" onChange={() => {}} innerRef={inviteLinkRef} />
        </Form>
      </ModalBody>
    </Modal>
  );
};

InvitedLinkModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggleModal: PropTypes.func.isRequired
};

const InvitePeople = ({ inputCol, btnCol, className, brClass, titleClass, footerTitleClass, isInputAutoFocus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [recipient, setRecipient] = useState('');

  const toggleModal = () => setIsOpen(!isOpen);

  const handleSendInvitation = e => {
    e.preventDefault();
    toast.success(
      <Fragment>
        Send invitation to <span className="font-weight-semi-bold font-italic">{recipient}</span>
      </Fragment>
    );
    setRecipient('');
  };

  return (
    <Card className={className}>
      <CardBody className="overflow-hidden text-center pt-5">
        <Row className="justify-content-center">
          <Col xs={7} md={5}>
            <img className="img-fluid" src={gifts} alt="" />
          </Col>
        </Row>
        <h3 className={`mt-3 mt-md-4 font-weight-normal  ${titleClass}`}>Invite a friend, you both get $100</h3>
        <p className="lead">
          Invite your friends and start working together in seconds. <br className={brClass} />
          Everyone you invite will receive a welcome email.
        </p>
        <Row className="justify-content-center mt-5 mb-4">
          <Col md={inputCol}>
            <Form onSubmit={handleSendInvitation}>
              <Row form>
                <Col className="mb-2 mb-sm-0">
                  <Input
                    type="email"
                    placeholder="Email address"
                    aria-label="Recipient's username"
                    value={recipient}
                    onChange={({ target }) => setRecipient(target.value)}
                    autoFocus={isInputAutoFocus}
                  />
                </Col>
                <Col xs={12} sm="auto">
                  <Button color="primary" block type="submit">
                    Send Invitation
                  </Button>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
      </CardBody>
      <CardFooter className="d-flex justify-content-center bg-light text-center pt-4">
        <Col xs={10}>
          <h4 className={`font-weight-normal mb-3 ${footerTitleClass}`}>More ways to invite your friends</h4>
          <Row className="my-4" form>
            <Col xl={btnCol}>
              <Button color="falcon-default" block className="mb-2">
                <img src={logoGmail} width="20" alt="" />
                <span className="font-weight-medium ml-2">Invite from Gmail</span>
              </Button>
            </Col>
            <Col xl={btnCol}>
              <ButtonIcon color="falcon-default" block icon="link" className="mb-2" onClick={toggleModal}>
                <span className="font-weight-medium ml-1">Copy Link</span>
              </ButtonIcon>
              <InvitedLinkModal isOpen={isOpen} toggleModal={toggleModal} />
            </Col>
            <Col xl={btnCol}>
              <ButtonIcon
                color="falcon-default"
                block
                className="mb-2"
                icon={['fab', 'facebook-square']}
                iconClassName="text-facebook"
                transform="grow-2"
              >
                <span className="font-weight-medium ml-1">Share on Facebook</span>
              </ButtonIcon>
            </Col>
          </Row>
          <p className="mb-2 fs--1">
            Once you’ve invited friends, you can <Link to="#!">view the status of your referrals</Link>
            <br className="d-none d-xl-block d-xxl-none" /> or visit our <Link to="#!">Help Center</Link> if you have
            any questions.
          </p>
        </Col>
      </CardFooter>
    </Card>
  );
};

InvitePeople.propTypes = {
  inputCol: PropTypes.number,
  btnCol: PropTypes.number,
  className: PropTypes.string,
  brClass: PropTypes.string,
  titleClass: PropTypes.string,
  footerTitleClass: PropTypes.string,
  isInputAutoFocus: PropTypes.bool
};
InvitePeople.defaultProps = {
  inputCol: 7,
  btnCol: 4,
  brClass: 'd-md-block d-none',
  titleClass: 'fs-2 fs-md-3',
  footerTitleClass: 'fs-1 fs-md-2',
  isInputAutoFocus: true
};

export default InvitePeople;
