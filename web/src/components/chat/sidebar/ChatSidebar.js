import React, { useContext } from 'react';
import { Nav } from 'reactstrap';
import Scrollbar from 'react-scrollbars-custom';
import ChatThread from './ChatThread';
import ChatContactsSearch from './ChatContactsSearch';
import AppContext, { ChatContext } from '../../../context/Context';
import { isIterableArray } from '../../../helpers/utils';

const ChatSidebar = () => {
  const { isRTL } = useContext(AppContext);
  const { threads } = useContext(ChatContext);

  return (
    <div className="chat-sidebar rounded-left">
      <div className="contacts-list bg-white">
        <Scrollbar
          style={{
            height: '100%',
            minWidth: '75px'
          }}
          rtl={isRTL}
          noScrollX
          trackYProps={{
            renderer(props) {
              const { elementRef, ...restProps } = props;
              return <span {...restProps} ref={elementRef} className="TrackY" />;
            }
          }}
        >
          <Nav className="border-0">
            {isIterableArray(threads) && threads.map(thread => <ChatThread thread={thread} key={thread.id} />)}
          </Nav>
        </Scrollbar>
      </div>
      <ChatContactsSearch />
    </div>
  );
};

export default ChatSidebar;
