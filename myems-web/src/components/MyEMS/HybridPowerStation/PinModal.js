import React, { useState, useEffect } from 'react';
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
} from 'reactstrap';
import Flex from '../../common/Flex';
import ReactCodeInput from 'react-code-input';
import { withTranslation } from 'react-i18next';
import { createCookie, getItemFromStore, setItemToStore } from '../../../helpers/utils';

const CORRECT_PIN_CODE = "111222";

const PinModal = ({ setIsOpenPinModal, isOpenPinModal, t }) => {
  const [isPinCodeValid, setIsPinCodeValid] = useState(true);
  const [pinCode, setPinCode] = useState("");

  const onCloseButtonClick = e => {
    e.preventDefault();
    setIsOpenPinModal(false);
    // setPinCode("");
    // createCookie('is_pin_valid', false, 1000 * 60);
  };

  const handlePinChange = pinCode => {
    setPinCode(pinCode);
  };

  const onSubmitButtonClick = e => {
    e.preventDefault();
    if (pinCode === CORRECT_PIN_CODE) {
      setIsPinCodeValid(true);
      setIsOpenPinModal(false);
      setPinCode("");
      createCookie('is_pin_valid', true, 1000 * 60);
    } else {
      setIsPinCodeValid(false);
      setIsOpenPinModal(true);
      setPinCode("");
      createCookie('is_pin_valid', false, 1000 * 60);
    }
  };

  const closeButton = (
    <button className="close font-weight-normal" onClick={onCloseButtonClick}>
      &times;
    </button>
  );

  return (
    <Modal isOpen={isOpenPinModal} autoFocus={true} modalClassName="theme-modal" contentClassName="border">
      <Form
        onSubmit={onSubmitButtonClick}
      >
        <ModalHeader className="bg-light d-flex flex-between-center border-bottom-0" close={closeButton}>
          {t('Pin Code')}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <ReactCodeInput
              id='pinCode'
              isValid={isPinCodeValid}
              autoFocus={true}
              type='password'
              fields={6}
              onChange={handlePinChange}
              value={pinCode} />
          </FormGroup>
        </ModalBody>
        <ModalFooter tag={Flex} justify="end" align="center" className="bg-light border-top-0">
          <Button color="primary" type="submit" className="px-4">
            {t('Unlock')}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

PinModal.propTypes = {
};

export default withTranslation()(PinModal);