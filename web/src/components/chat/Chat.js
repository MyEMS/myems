import React from 'react';
import { Card, CardBody } from 'reactstrap';
import ChatProvider from './ChatProvider';
import ChatSidebar from './sidebar/ChatSidebar';
import ChatContent from './content/ChatContent';
import Flex from '../common/Flex';

const Chat = () => (
  <ChatProvider>
    <Card className="card-chat">
      <CardBody tag={Flex} className="p-0 h-100">
        <ChatSidebar />
        <ChatContent />
      </CardBody>
    </Card>
  </ChatProvider>
);

export default Chat;
