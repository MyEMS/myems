import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  CustomInput
} from 'reactstrap';
import Flex from '../../common/Flex';
import ReactCodeInput from 'react-code-input';


const PinModal = ({
  setIsOpenPinModal,
  isOpenPinModal,
}) => {
  const toggle = () => setIsOpenPinModal(!isOpenPinModal);

  const closeBtn = (
    <button className="close font-weight-normal" onClick={toggle}>
      &times;
    </button>
  );

  return (
    <Modal isOpen={isOpenPinModal} toggle={toggle} modalClassName="theme-modal" contentClassName="border">
      <Form
        onSubmit={e => {
          e.preventDefault();
          setIsOpenPinModal(false);
        }}
      >
        <ModalHeader toggle={toggle} className="bg-light d-flex flex-between-center border-bottom-0" close={closeBtn}>
          Pin
        </ModalHeader>
        <ModalBody>
          <FormGroup>
          <ReactCodeInput type='password' fields={6} />
          </FormGroup>
        </ModalBody>
        <ModalFooter tag={Flex} justify="end" align="center" className="bg-light border-top-0">
          <Button color="primary" type="submit" className="px-4">
            解锁
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

PinModal.propTypes = {
};

export default PinModal;
