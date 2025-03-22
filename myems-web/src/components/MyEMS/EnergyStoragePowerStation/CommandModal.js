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
  Input
} from 'reactstrap';
import Flex from '../../common/Flex';
import { withTranslation } from 'react-i18next';
import { APIBaseURL, settings } from '../../../config';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import { toast } from 'react-toastify';

const CommandModal = ({
  setIsOpenCommandModal,
  isOpenCommandModal,
  id,
  name,
  description,
  set_value,
  t
}) => {
  const [newValue, setNewValue] = useState(undefined);
  const [commandID, setCommandID] = useState(undefined);
  useEffect(() => {
    setCommandID(id);
  });
  const toggle = () => setIsOpenCommandModal(!isOpenCommandModal);

  const closeButton = (
    <button className="close font-weight-normal" onClick={toggle}>
      &times;
    </button>
  );
  const handleInputSetValue = e => {
    e.preventDefault();
    setNewValue(e.target.value);
  }
  const handleSubmit = e => {
    e.preventDefault();
    let isResponseOK = false;
    fetch(APIBaseURL + '/commands/'+commandID+'/send', {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          set_value: Number(newValue)
        }
      }),
      headers: {
        'Content-type': 'application/json',
        'User-UUID': getCookieValue('user_uuid'),
        Token: getCookieValue('token')
      }
    })
    .then(response => {
      if (response.ok) {
        isResponseOK = true;
      }
      return response.json();
    })
    .then(json => {
      if (isResponseOK) {
        toast.success(t('Command has been submitted'));
      } else {
        toast.error(t(json.description));
      }
    })
    .catch(err => {
      console.log(err);
    });
    setIsOpenCommandModal(false);
  };

  return (
    <Modal isOpen={isOpenCommandModal} toggle={toggle} modalClassName="theme-modal" contentClassName="border">
      <Form
        onSubmit={handleSubmit}
      >
        <ModalHeader toggle={toggle} className="bg-light d-flex flex-between-center border-bottom-0" close={closeButton}>
          {name}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label className="fs-0" for="input_set_value">
              {t('Set Value')}
            </Label>
            <Input
              type="number"
              name="set_value"
              id="input_set_value"
              onChange={handleInputSetValue}
              defaultValue={set_value}
            />
            <Label className="fs-0" for="description">
              {description}
            </Label>
          </FormGroup>
        </ModalBody>
        <ModalFooter tag={Flex} justify="end" align="center" className="bg-light border-top-0">
          <Button color="primary" type="submit" className="px-4">
            {t('Submit')}
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

CommandModal.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  set_value: PropTypes.number,
};

export default withTranslation()(CommandModal);
