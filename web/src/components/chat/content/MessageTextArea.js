import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Input, Label, Form, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import AppContext, { ChatContext } from '../../../context/Context';
import classNames from 'classnames';
import { getGrays } from '../../../helpers/utils';

const formatDate = date => {
  const options = {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };

  const now = date
    .toLocaleString('en-US', options)
    .split(',')
    .map(item => item.trim());

  return {
    day: now[0],
    hour: now[3],
    date: now[1] + ', ' + now[2]
  };
};

const MessageTextArea = ({ thread }) => {
  const { isDark, isRTL } = useContext(AppContext);
  const { messages, messagesDispatch, threadsDispatch, textAreaInitialHeight, setTextAreaInitialHeight } = useContext(
    ChatContext
  );
  const [previewEmoji, setPreviewEmoji] = useState(false);
  const [message, setMessage] = useState('');

  //Emoji box hiding Controller
  useEffect(() => {
    const handleClickOutsideEmojiBox = e => {
      if (e.target.closest('.emoji-mart') || e.target.closest('.textarea')) return;
      setPreviewEmoji(false);
    };

    if (previewEmoji) {
      document.addEventListener('click', handleClickOutsideEmojiBox, false);
    } else {
      document.removeEventListener('click', handleClickOutsideEmojiBox, false);
    }

    return () => document.removeEventListener('click', handleClickOutsideEmojiBox, false);
  }, [previewEmoji]);

  useEffect(() => {
    //TextBox and message body height controlling
    let textAreaPreviousHeight = textAreaInitialHeight;
    const autoExpand = function(field) {
      // Reset field height
      field.style.height = '2rem';

      // Calculate the height
      const textAreaCurrentHeight = field.scrollHeight;

      if (textAreaCurrentHeight <= 160) {
        if (textAreaPreviousHeight !== textAreaCurrentHeight) {
          document.getElementsByClassName('card-chat-pane')[0].style.height = `calc(100% - ${textAreaCurrentHeight}px)`;

          setTextAreaInitialHeight((textAreaPreviousHeight = textAreaCurrentHeight));
        }
      }

      field.style.height = textAreaCurrentHeight + 'px';
    };
    document.addEventListener(
      'input',
      function(event) {
        if (event.target.className === 'textarea');
        autoExpand(event.target);
      },
      false
    );
  }, [textAreaInitialHeight, setTextAreaInitialHeight]);

  const addEmoji = e => {
    let emoji = e.native;
    setMessage(message + emoji);
  };

  const handleSubmit = e => {
    e.preventDefault();
    const date = new Date();

    let newMessage = {
      senderUserId: 3,
      message: `${message.replace(/(?:\r\n|\r|\n)/g, '<br>')}`,
      status: 'delivered',
      time: formatDate(date)
    };

    const { content } = messages.find(({ id }) => id === thread.messagesId);
    if (message) {
      messagesDispatch({
        type: 'EDIT',
        payload: { id: thread.messagesId, content: [...content, newMessage] },
        id: thread.messagesId
      });

      threadsDispatch({
        type: 'EDIT',
        payload: thread,
        id: thread.id,
        isUpdatedStart: true
      });
    }

    setMessage('');

    document.getElementsByClassName('textarea')[0].style.height = '2rem';
    document.getElementsByClassName('card-chat-pane')[0].style.height = `calc(100% - 2rem)`;
  };

  return (
    <Form className="chat-editor-area bg-white" onSubmit={handleSubmit}>
      <Input className="d-none" type="file" id="chat-file-upload" />
      <Label for="chat-file-upload" className="mb-0 p-1 chat-file-upload cursor-pointer">
        <FontAwesomeIcon icon="paperclip" />
      </Label>

      <Input
        className="border-0 outline-none shadow-none resize-none textarea bg-white"
        type="textarea"
        placeholder="Type your message"
        bsSize="sm"
        value={message}
        onChange={({ target }) => setMessage(target.value)}
        style={{
          height: '2rem',
          maxHeight: '10rem',
          paddingRight: isRTL ? '0.75rem' : '7rem',
          paddingLeft: isRTL ? '7rem' : '0.75rem'
        }}
      />
      <FontAwesomeIcon
        icon={['far', 'laugh-beam']}
        transform="grow-5"
        className="emoji-icon"
        onClick={() => setPreviewEmoji(!previewEmoji)}
      />
      {previewEmoji && (
        <Picker
          set="google"
          onSelect={addEmoji}
          sheetSize={20}
          style={{
            position: 'absolute',
            bottom: '100%',
            left: isRTL ? '2%' : 'auto',
            right: isRTL ? 'auto' : '2%',
            padding: 0,
            zIndex: 1,
            backgroundColor: getGrays(isDark)[100]
          }}
          theme={isDark ? 'dark' : 'light'}
          showPreview={false}
          showSkinTones={false}
        />
      )}
      <Button
        color="transparent"
        size="sm"
        className={classNames(`btn-send outline-none ml-1`, {
          'text-primary': message.length > 0
        })}
        type="submit"
      >
        Send
      </Button>
    </Form>
  );
};

MessageTextArea.propTypes = {
  thread: PropTypes.object.isRequired
};

export default MessageTextArea;
