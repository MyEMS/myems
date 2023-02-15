import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UncontrolledTooltip, Button, Col, Row } from 'reactstrap';
import { ChatContext } from '../../../context/Context';
import Flex from '../../common/Flex';

const ChatContentHeader = ({ thread, setIsOpenThreadInfo }) => {
  const { getUser } = useContext(ChatContext);
  const user = getUser(thread);

  return (
    <div className="chat-content-header">
      <Row className="flex-between-center">
        <Col md={8} xs={6} tag={Flex} align="center">
          <div
            className="pr-3 text-700 d-md-none contacts-list-show cursor-pointer"
            onClick={() => (document.getElementsByClassName('chat-sidebar')[0].style.left = 0)}
          >
            <FontAwesomeIcon icon="chevron-left" />
          </div>
          <div className="min-w-0">
            <h5 className="mb-0 text-truncate fs-0">{user.name}</h5>
            <div className="fs--2 text-400">
              {user.status === 'status-online' ? 'Active on  chat' : 'Active 7h ago'}
            </div>
          </div>
        </Col>
        <Col xs="auto">
          <Button color="falcon-primary" className="mr-2" size="sm" id="call-tooltip">
            <FontAwesomeIcon icon="phone" />
            <UncontrolledTooltip placement="left" target="call-tooltip" innerClassName="fs--1">
              Start a Audio Call
            </UncontrolledTooltip>
          </Button>
          <Button color="falcon-primary" className="mr-2" size="sm" id="video-tooltip">
            <FontAwesomeIcon icon="video" />
            <UncontrolledTooltip placement="left" target="video-tooltip" innerClassName="fs--1">
              Start a Video Call
            </UncontrolledTooltip>
          </Button>
          <Button
            color="falcon-primary"
            size="sm"
            id="info-tooltip"
            onClick={() => setIsOpenThreadInfo(prevState => !prevState)}
          >
            <FontAwesomeIcon icon="info" />
            <UncontrolledTooltip placement="left" target="info-tooltip" innerClassName="fs--1">
              Conversation Information
            </UncontrolledTooltip>
          </Button>
        </Col>
      </Row>
    </div>
  );
};

ChatContentHeader.propTypes = {
  thread: PropTypes.object.isRequired,
  setIsOpenThreadInfo: PropTypes.func.isRequired
};

export default ChatContentHeader;
