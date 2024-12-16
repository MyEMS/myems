import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import { v4 as uuid } from 'uuid';
import Flex from '../../common/Flex';

const CommandModal = ({
  setIsOpenCommandModal,
  isOpenCommandModal,
  id,
  name,
  description,
  set_value
}) => {
  const toggle = () => setIsOpenCommandModal(!isOpenCommandModal);

  const [formObj, setFormObj] = useState({ id: uuid() });
  const closeBtn = (
    <button className="close font-weight-normal" onClick={toggle}>
      &times;
    </button>
  );

  const handleChange = target => {
    let name = target.name;
    let value = name === 'allDay' ? target.checked : target.value;
    setFormObj({ ...formObj, [name]: value });
  };


  return (
    <Modal isOpen={isOpenCommandModal} toggle={toggle} modalClassName="theme-modal" contentClassName="border">
      <Form
        onSubmit={e => {
          e.preventDefault();
          setIsOpenCommandModal(false);
        }}
      >
        <ModalHeader toggle={toggle} className="bg-light d-flex flex-between-center border-bottom-0" close={closeBtn}>
          指令 {name}
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label className="fs-0" for="set_value">
              设定值
            </Label>
            <Input
              type="number"
              name="set_value"
              id="set_value"
              value={set_value}
              onChange={({ target }) => handleChange(target)}
            />
            <Label className="fs-0" for="description">
              {description}
            </Label>
          </FormGroup>
          {/* <FormGroup>
            <Label for="eventLabel">Label</Label>
            <CustomInput type="select" id="eventLabel" name="className" onChange={({ target }) => handleChange(target)}>
              <option>None</option>
              <option value="bg-soft-info">Business</option>
              <option value="bg-soft-danger">Important</option>
              <option value="bg-soft-warning">Personal</option>
              <option value="bg-soft-success">Must Attend</option>
            </CustomInput>
          </FormGroup> */}
        </ModalBody>
        <ModalFooter tag={Flex} justify="end" align="center" className="bg-light border-top-0">
          <Button color="primary" type="submit" className="px-4">
            发送
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

export default CommandModal;
