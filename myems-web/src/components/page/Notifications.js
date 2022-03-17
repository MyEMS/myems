import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Alert,
  Button,
  Card,
  CardBody,
  Col,
  CustomInput,
  Form,
  Input,
  Label,
  ListGroup,
  ListGroupItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row
} from 'reactstrap';
import Notification from '../notification/Notification';
import FalconCardHeader from '../common/FalconCardHeader';
import Loader from '../common/Loader';
import { isIterableArray } from '../../helpers/utils';
import { notifications as rawNotifications } from '../../data/notification/notification';
import useFakeFetch from '../../hooks/useFakeFetch';

const NotificationSettings = () => {
  const [check1, setCheck1] = useState(true);
  const [check2, setCheck2] = useState(true);
  const [check3, setCheck3] = useState(true);

  const listGroupItemClasses = 'd-flex justify-content-between align-items-center py-2 px-0 border-200';

  return (
    <Form>
      <CustomInput
        type="radio"
        id="exampleCustomRadio"
        name="customRadio"
        label="Get a notification each time there is activity on your page or an important update."
      />
      <CustomInput
        type="radio"
        id="exampleCustomRadio2"
        name="customRadio"
        label="Get one notification every 12-24 hours on all activity and updates."
      />
      <CustomInput type="radio" id="exampleCustomRadio3" name="customRadio" label="Off" />

      <h5 className="fs-0 mb-3 mt-4">Edit your notification settings for: </h5>

      <ListGroup flush className="mb-4 fs--1">
        <ListGroupItem className={listGroupItemClasses}>
          <span>New Mention of Page </span>
          <span>
            <Label check />
            <Input type="checkbox" checked={check1} onChange={() => setCheck1(!check1)} />
          </span>
        </ListGroupItem>
        <ListGroupItem className={listGroupItemClasses}>
          <span>New Comments on page post</span>
          <span>
            <Label check />
            <Input type="checkbox" checked={check2} onChange={() => setCheck2(!check2)} />
          </span>
        </ListGroupItem>
        <ListGroupItem className={listGroupItemClasses}>
          <span>Edits to Comments you have written</span>
          <span>
            <Label check />
            <Input type="checkbox" checked={check3} onChange={() => setCheck3(!check3)} />
          </span>
        </ListGroupItem>
      </ListGroup>

      <CustomInput
        type="checkbox"
        id="customCheckboxActivity"
        label="Allow notifications from your followers activity"
      />
      <CustomInput type="checkbox" id="customCheckboxAssociationsGroups" label="Groups" />
      <CustomInput type="checkbox" id="customCheckboxAssociations" label="Associations" />
    </Form>
  );
};

const Notifications = ({ items = rawNotifications.length, children }) => {
  const { loading, data: notifications, setData: setNotifications } = useFakeFetch(rawNotifications);
  const [settingsIsOpen, setSettingsIsOpen] = useState(false);

  const toggleSettingsModal = () => setSettingsIsOpen(!settingsIsOpen);

  const markAsRead = e => {
    e.preventDefault();
    const updatedNotifications = notifications.map(notification => {
      if (!notification.hasOwnProperty('unread')) return notification;

      return {
        ...notification,
        unread: false
      };
    });

    setNotifications(updatedNotifications);
  };

  return (
    <Card className="h-100">
      <FalconCardHeader title="Your Notifications">
        <div className="fs--1">
          <Link className="text-sans-serif" to="#!" onClick={markAsRead}>
            Mark all as read
          </Link>
          <Link className="text-sans-serif ml-2 ml-sm-3" to="#!" onClick={toggleSettingsModal}>
            Notification settings
          </Link>
        </div>

        <Modal isOpen={settingsIsOpen} toggle={toggleSettingsModal} centered size="lg">
          <ModalHeader>Notification Settings</ModalHeader>
          <ModalBody>
            <NotificationSettings />
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" size="sm" onClick={toggleSettingsModal}>
              Cancel
            </Button>
            <Button color="primary" size="sm" onClick={toggleSettingsModal}>
              Update
            </Button>
          </ModalFooter>
        </Modal>
      </FalconCardHeader>
      <CardBody className="p-0">
        {loading ? (
          <Loader />
        ) : isIterableArray(notifications) ? (
          notifications.slice(0, items).map((notification, index) => <Notification {...notification} key={index} />)
        ) : (
          <Row className="p-card">
            <Col>
              <Alert color="info" className="mb-0">
                No notifications found!
              </Alert>
            </Col>
          </Row>
        )}
      </CardBody>
      {children}
    </Card>
  );
};

Notifications.propTypes = {
  items: PropTypes.number,
  children: PropTypes.node
};

export default Notifications;
