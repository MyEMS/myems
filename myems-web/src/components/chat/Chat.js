import React, { useEffect } from 'react';
import { Card, CardBody } from 'reactstrap';
import ChatProvider from './ChatProvider';
import ChatSidebar from './sidebar/ChatSidebar';
import ChatContent from './content/ChatContent';
import Flex from '../common/Flex';

const Chat = () => {
  useEffect(() => {
    document.body.classList.add('overflow-hidden');
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, []);
  return (
    <ChatProvider>
      <Card className="card-chat">
        <CardBody tag={Flex} className="p-0 h-100">
          <ChatSidebar />
          <ChatContent />
        </CardBody>
      </Card>
    </ChatProvider>
  );
};

export default Chat;
