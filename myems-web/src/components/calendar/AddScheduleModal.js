import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import Datetime from 'react-datetime';
import { v4 as uuid } from 'uuid';
import Flex from '../common/Flex';

const AddScheduleModal = ({
  setIsOpenScheduleModal,
  isOpenScheduleModal,
  setInitialEvents,
  initialEvents,
  addScheduleStartDate,
  setAddScheduleStartDate
}) => {
  const toggle = () => setIsOpenScheduleModal(!isOpenScheduleModal);

  const [formObj, setFormObj] = useState({ id: uuid() });
  const [endDate, setEndDate] = useState();
  const [startDate, setStartDate] = useState();
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

  useEffect(() => {
    !isOpenScheduleModal && setAddScheduleStartDate(null);
    !isOpenScheduleModal && setEndDate(null);
    !isOpenScheduleModal && setStartDate(null);
    setFormObj({ ...formObj, start: addScheduleStartDate });
    // eslint-disable-next-line
  }, [isOpenScheduleModal, addScheduleStartDate]);

  return (
    <Modal isOpen={isOpenScheduleModal} toggle={toggle} modalClassName="theme-modal" contentClassName="border">
      <Form
        onSubmit={e => {
          e.preventDefault();
          setIsOpenScheduleModal(false);
          setInitialEvents([...initialEvents, formObj]);
        }}
      >
        <ModalHeader toggle={toggle} className="bg-light d-flex flex-between-center border-bottom-0" close={closeBtn}>
          Create Schedule
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label className="fs-0" for="eventTitle">
              Title
            </Label>
            <Input name="title" id="eventTitle" required onChange={({ target }) => handleChange(target)} />
          </FormGroup>
          <FormGroup>
            <Label className="fs-0" for="eventStart">
              Start Date
            </Label>
            <Datetime
              timeFormat={true}
              value={startDate || addScheduleStartDate}
              onChange={dateTime => {
                if (dateTime._isValid) {
                  setStartDate(dateTime);
                  let date = {};
                  date.value = dateTime.format();
                  date.name = 'start';
                  handleChange(date);
                }
              }}
              dateFormat="MM-DD-YYYY"
              inputProps={{ placeholder: 'MM-DD-YYYY H:M', id: 'eventStart' }}
            />
          </FormGroup>
          <FormGroup>
            <Label className="fs-0" for="eventEnd">
              End Date
            </Label>
            <Datetime
              value={endDate}
              timeFormat={true}
              onChange={dateTime => {
                if (dateTime._isValid) {
                  setEndDate(dateTime);
                  let date = {};
                  date.value = dateTime.format();
                  date.name = 'end';
                  handleChange(date);
                }
              }}
              dateFormat="MM-DD-YYYY"
              inputProps={{ placeholder: 'MM-DD-YYYY H:M', id: 'eventEnd' }}
            />
          </FormGroup>
          <FormGroup>
            <CustomInput
              name="allDay"
              type="checkbox"
              id="allDay"
              label="All Day"
              onChange={({ target }) => handleChange(target)}
            />
          </FormGroup>
          <FormGroup>
            <Label className="fs-0">Schedule Meeting</Label>
            <div>
              <Button color="" type="button" className="text-left bg-soft-info text-info">
                <FontAwesomeIcon icon="video" className="mr-2" />
                <span>Add video conference link</span>
              </Button>
            </div>
          </FormGroup>
          <FormGroup>
            <Label className="fs-0" for="eventDescription">
              Description
            </Label>
            <Input
              type="textarea"
              name="description"
              id="eventDescription"
              onChange={({ target }) => handleChange(target)}
            />
          </FormGroup>
          <FormGroup>
            <Label for="eventLabel">Label</Label>
            <CustomInput type="select" id="eventLabel" name="className" onChange={({ target }) => handleChange(target)}>
              <option>None</option>
              <option value="bg-soft-info">Business</option>
              <option value="bg-soft-danger">Important</option>
              <option value="bg-soft-warning">Personal</option>
              <option value="bg-soft-success">Must Attend</option>
            </CustomInput>
          </FormGroup>
        </ModalBody>
        <ModalFooter tag={Flex} justify="end" align="center" className="bg-light border-top-0">
          <Button color="link" tag="a" href="pages/event-create" className="text-600">
            More Option
          </Button>
          <Button color="primary" type="submit" className="px-4">
            Save
          </Button>
        </ModalFooter>
      </Form>
    </Modal>
  );
};

export default AddScheduleModal;
