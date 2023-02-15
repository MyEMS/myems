import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Media } from 'reactstrap';
import LastMessage from './LastMessage';
import Avatar from '../../common/Avatar';
import Flex from '../../common/Flex';
import ChatSidebarDropdownAction from './ChatSidebarDropdownAction';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ChatContext } from '../../../context/Context';
import classNames from 'classnames';

const ChatThread = ({ thread }) => {
  const { threadsDispatch, messages, activeThreadId, setActiveThreadId, getUser } = useContext(ChatContext);
  const message = messages.find(({ id }) => id === thread.messagesId);
  const lastMessage = message?.content[message.content.length - 1];
  const user = getUser(thread);

  return (
    <Media
      className={classNames(`chat-contact hover-actions-trigger w-100 `, {
        'unread-message': !thread.read,
        'read-message': thread.read,
        active: thread.id === activeThreadId
      })}
      onClick={() => {
        setActiveThreadId(thread.id);
        threadsDispatch({ type: 'EDIT', id: thread.id, payload: { ...thread, read: true } });

        document.getElementsByClassName('chat-sidebar')[0].style.left = '-100%';
      }}
    >
      <Avatar className={user.status} src={user.avatarSrc} size="xl" />
      <Media body className="chat-contact-body ml-2 d-md-none d-lg-block">
        <Flex justify="between">
          <h6 className="mb-0 chat-contact-title">{user.name}</h6>
          <span className="message-time fs--2"> {!!lastMessage && lastMessage.time.day} </span>
        </Flex>
        <div className="min-w-0">
          <div
            className="chat-contact-content pr-3"
            dangerouslySetInnerHTML={{
              __html: LastMessage(lastMessage, thread)
            }}
          />
          <ChatSidebarDropdownAction />
          <div className="position-absolute b-0 r-0 hover-hide">
            {!!lastMessage?.status && (
              <FontAwesomeIcon
                icon={classNames({
                  check: lastMessage.status === 'seen' || lastMessage.status === 'sent',
                  'check-double': lastMessage.status === 'delivered'
                })}
                transform="shrink-5 down-4"
                className={classNames({
                  'text-success': lastMessage.status === 'seen',
                  'text-400': lastMessage.status === 'delivered' || lastMessage.status === 'sent'
                })}
              />
            )}
          </div>
        </div>
      </Media>
    </Media>
  );
};

ChatThread.propTypes = {
  thread: PropTypes.object.isRequired
};

export default ChatThread;
