import React from 'react';
import { Modal, ModalBody, Media, Button } from 'reactstrap';
import Lottie from 'react-lottie';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import animationData from './lottie/warning-light.json';

const WizardModal = ({ toggle, modal, setModal }) => {
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };
  return (
    <Modal isOpen={modal} toggle={toggle} centered={true} style={{ width: '400px' }}>
      <ModalBody className="p-4">
        <Button
          className="btn text-danger position-absolute t-0 r-0  mr-2 mt-1  p-0 bg-transparent border-0"
          onClick={() => setModal(!modal)}
        >
          <FontAwesomeIcon icon="times" className="" />
        </Button>
        <Media className="flex-center">
          <Lottie options={defaultOptions} style={{ width: '100px' }} />
          <Media body>
            You don't have access to <br />
            the link. Please try again.
          </Media>
        </Media>
      </ModalBody>
    </Modal>
  );
};

export default WizardModal;
