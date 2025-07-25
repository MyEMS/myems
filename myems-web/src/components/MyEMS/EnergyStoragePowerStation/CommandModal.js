import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from 'reactstrap';
import Flex from '../../common/Flex';
import { withTranslation } from 'react-i18next';
import { APIBaseURL, settings } from '../../../config';
import { getCookieValue, createCookie, checkEmpty } from '../../../helpers/utils';
import { toast } from 'react-toastify';

const CommandModal = ({ setIsOpenCommandModal, isOpenCommandModal, id, name, description, payload, t }) => {
  const [newPayload, setNewPayload] = useState(payload);
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
  const handleInputPayload = e => {
    e.preventDefault();
    setNewPayload(e.target.value);
  };
  const handleSubmit = e => {
    e.preventDefault();
    setNewPayload(e.target.value);
    let isResponseOK = false;
    fetch(APIBaseURL + '/commands/' + commandID + '/send', {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          payload: newPayload
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
          toast.success(t('命令已下发'));
          // toast.success(t('Command has been submitted'));
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
      <Form onSubmit={handleSubmit}>
        <ModalHeader
          toggle={toggle}
          className="bg-light d-flex flex-between-center border-bottom-0"
          close={closeButton}
        >
          {name}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label className="fs-0" for="input_payload">
              {t('Payload')}
            </Label>
            <Input
              type="textarea"
              id="input_payload"
              name="payload"
              rows="10"
              cols="50"
              onChange={handleInputPayload}
              defaultValue={payload}
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
  payload: PropTypes.string,
  description: PropTypes.string.isRequired,
};

export default withTranslation()(CommandModal);
