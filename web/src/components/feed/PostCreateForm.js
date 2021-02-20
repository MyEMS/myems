import React, { useState, useContext, Fragment } from 'react';
import classNames from 'classnames';
import {
  Card,
  CardBody,
  Col,
  Row,
  Media,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Input,
  Form,
  Button
} from 'reactstrap';
import Avatar from '../common/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from '../common/Flex';
import ButtonImgPostCreate from './ButtonImgPostCreate';
import FalconCardHeader from '../common/FalconCardHeader';
import { FeedContext } from '../../context/Context';
import uuid from 'uuid/v1';

import av3 from '../../assets/img/team/3.jpg';
import postLocation from '../../assets/img/illustrations/location.svg';
import postCalendar from '../../assets/img/illustrations/calendar.svg';
import postImage from '../../assets/img/illustrations/image.svg';

const PostCreateForm = () => {
  const { feedDispatch } = useContext(FeedContext);
  const [privacy, setPrivacy] = useState('public');
  const [status, setStatus] = useState('');

  const handleSubmit = e => {
    e.preventDefault();

    const feed = {
      id: uuid(),
      user: {
        name: 'Rebecca Marry',
        avatarSrc: av3,
        time: 'Just now',
        location: 'Dalby',
        status: 'status-online',
        privacy
      },
      content: { status },
      footer: { countLCS: { like: 0, share: 0 } }
    };

    !!status && feedDispatch({ type: 'ADD', payload: feed, isAddToStart: true });

    setStatus('');
  };

  return (
    <Card className="mb-3">
      <FalconCardHeader
        title={
          <Fragment>
            <Avatar src={av3} size="m" />
            <Media body className="ml-2">
              <h5 className="mb-0 fs-0">Create post</h5>
            </Media>
          </Fragment>
        }
        titleTag={Media}
        titleClass="align-items-center"
      />
      <CardBody className="p-0">
        <Form onSubmit={handleSubmit}>
          <Input
            className="border-0 rounded-0 resize-none"
            placeholder="What do you want to talk about?"
            type="textarea"
            rows="4"
            spellCheck="false"
            value={status}
            onChange={({ target }) => {
              setStatus(target.value);
            }}
          />
          <Flex align="center" className="border-y px-3 mt-1">
            <label className="text-nowrap mb-0 mr-2" htmlFor="hash-tags">
              <FontAwesomeIcon icon="plus" className="mr-1 fs--2" />
              <span className="font-weight-regular">Add Hashtag</span>
            </label>
            <Input className="border-0 fs--1" id="hash-tags" type="text" placeholder="Help the right person to see" />
          </Flex>
          <Row noGutters className="justify-content-between mt-3 px-3 pb-3">
            <Col className="col">
              <ButtonImgPostCreate imgSrc={postImage}>
                <span className="d-none d-md-inline-block">Image</span>
              </ButtonImgPostCreate>
              <ButtonImgPostCreate imgSrc={postCalendar}>
                <span className="d-none d-md-inline-block">Event</span>
              </ButtonImgPostCreate>
              <ButtonImgPostCreate imgSrc={postLocation}>
                <span className="d-none d-md-inline-block">Check in</span>
              </ButtonImgPostCreate>
            </Col>
            <Col xs="auto">
              <UncontrolledDropdown className="d-inline-block mr-1">
                <DropdownToggle color="Secondary" size="sm" className="p-0">
                  <FontAwesomeIcon
                    icon={classNames({
                      users: privacy === 'friends',
                      lock: privacy === 'private',
                      'globe-americas': privacy === 'public'
                    })}
                  />
                  <FontAwesomeIcon icon="caret-down" className="d-inline-block ml-1" />
                </DropdownToggle>
                <DropdownMenu right>
                  <DropdownItem onClick={() => setPrivacy('public')}>Public</DropdownItem>
                  <DropdownItem onClick={() => setPrivacy('private')}>Private</DropdownItem>
                  <DropdownItem onClick={() => setPrivacy('friends')}>Friends</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
              <Button className="px-4 px-sm-5" type="submit" color="primary" size="sm">
                Share
              </Button>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  );
};

export default PostCreateForm;
