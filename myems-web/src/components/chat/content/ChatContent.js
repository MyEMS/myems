import React, { useState, useContext } from 'react';
import { TabContent, TabPane } from 'reactstrap';
import ChatContentHeader from './ChatContentHeader';
import MessageTextArea from './MessageTextArea';
import ChatContentBody from './ChatContentBody';
import { ChatContext } from '../../../context/Context';

const ChatContent = () => {
  const { threads, activeThreadId } = useContext(ChatContext);
  const thread = threads.find(({ id }) => id === activeThreadId);
  const [isOpenThreadInfo, setIsOpenThreadInfo] = useState(false);

  return (
    <TabContent className="card-chat-content fs--1 position-relative">
      <TabPane className="card-chat-pane active">
        <ChatContentHeader thread={thread} setIsOpenThreadInfo={setIsOpenThreadInfo} />
        <ChatContentBody thread={thread} isOpenThreadInfo={isOpenThreadInfo} />
      </TabPane>

      <MessageTextArea thread={thread} />
    </TabContent>
  );
};

export default ChatContent;
