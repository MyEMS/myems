import React, { useState, useReducer } from 'react';
import PropTypes from 'prop-types';
import { ChatContext } from '../../context/Context';
import { arrayReducer } from '../../reducers/arrayReducer';
import { isIterableArray } from '../../helpers/utils';

import users from './../../data/people/people';
import rawThreads from './../../data/chat/threads';
import rawMessages from './../../data/chat/messages';
import groups from './../../data/chat/groups';

const ChatProvider = ({ children }) => {
  const [messages, messagesDispatch] = useReducer(arrayReducer, rawMessages);
  const [threads, threadsDispatch] = useReducer(arrayReducer, rawThreads);
  const [textAreaInitialHeight, setTextAreaInitialHeight] = useState(32);
  const [activeThreadId, setActiveThreadId] = useState(threads[0].id);

  const getUser = thread => {
    let user = {};

    if (isIterableArray(thread.userId)) {
      const { name, members } = groups.find(({ id }) => id === thread.userId[0]);
      user = {
        name,
        avatarSrc: members.map(member => users.find(({ id }) => id === member.userId).avatarSrc)
      };
    } else {
      user = users.find(({ id }) => id === thread.userId);
    }

    return user;
  };

  const value = {
    users,
    groups,
    threads,
    getUser,
    messages,
    activeThreadId,
    setActiveThreadId,
    threadsDispatch,
    messagesDispatch,
    textAreaInitialHeight,
    setTextAreaInitialHeight
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

ChatProvider.propTypes = { children: PropTypes.node.isRequired };

export default ChatProvider;
