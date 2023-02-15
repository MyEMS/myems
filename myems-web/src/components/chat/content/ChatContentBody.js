import React, { useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import Scrollbar from 'react-scrollbars-custom';
import Message from './Message';
import ThreadInfo from './ThreadInfo';
import { isIterableArray } from '../../../helpers/utils';
import AppContext, { ChatContext } from '../../../context/Context';
import ChatContentBodyIntro from './ChatContentBodyIntro';

const ChatContentBody = ({ thread, isOpenThreadInfo }) => {
  let lastDate = null;
  const { isRTL } = useContext(AppContext);
  const { messages, getUser, textAreaInitialHeight } = useContext(ChatContext);
  const [scrollHeight, setScrollHeight] = useState(0);
  const user = getUser(thread);
  const isGroup = isIterableArray(thread.userId);
  const { content } = messages.find(({ id }) => id === thread.messagesId);

  useEffect(() => {
    setTimeout(() => {
      setScrollHeight(document.getElementsByClassName('chat-content-scroll-area')[0].scrollHeight);
    }, 500);
  }, [textAreaInitialHeight]);

  return (
    <div className="chat-content-body" style={{ display: 'inherit' }}>
      <ThreadInfo thread={thread} isOpenThreadInfo={isOpenThreadInfo} />
      <Scrollbar
        style={{
          height: '100%',
          minWidth: '75px',
          display: 'block'
        }}
        rtl={isRTL}
        scrollTop={scrollHeight}
        noScrollX
        trackYProps={{
          renderer(props) {
            const { elementRef, ...restProps } = props;
            return <span {...restProps} ref={elementRef} className="TrackY" />;
          }
        }}
      >
        <div className="chat-content-scroll-area">
          <ChatContentBodyIntro user={user} isGroup={isGroup} />

          {isIterableArray(content) &&
            content.map(({ message, time, senderUserId, status }, index) => (
              <div key={index}>
                {lastDate !== time.date && (
                  <div className="text-center fs--2 text-500">{`${time.date}, ${time.hour}`}</div>
                )}
                {(() => {
                  lastDate = time.date;
                })()}
                <Message message={message} senderUserId={senderUserId} time={time} status={status} isGroup={isGroup} />
              </div>
            ))}
        </div>
      </Scrollbar>
    </div>
  );
};

ChatContentBody.propTypes = {
  thread: PropTypes.object.isRequired,
  isOpenThreadInfo: PropTypes.bool
};
ChatContentBody.defaultProps = {
  isOpenThreadInfo: false
};
export default ChatContentBody;
