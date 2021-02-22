import { useContext } from 'react';
import { ChatContext } from '../../../context/Context';
import { isIterableArray } from '../../../helpers/utils';
import PropTypes from 'prop-types';

const LastMessage = (lastMessage, thread) => {
  const { users } = useContext(ChatContext);
  const user = users.find(({ id }) => id === lastMessage?.senderUserId);
  const name = user?.name.split(' ');
  const lastMassagePreview =
    lastMessage?.messageType === 'attachment'
      ? `${name[0]} sent ${lastMessage.attachment}`
      : lastMessage?.message.split('<br>');

  if (!!lastMessage) {
    if (lastMessage.senderUserId === 3) {
      return `You: ${lastMassagePreview[0]}`;
    }

    if (isIterableArray(thread.userId)) {
      return `${name[0]}: ${lastMassagePreview}`;
    }

    return `${lastMassagePreview}`;
  }

  return 'Say hi to your new friend';
};
LastMessage.propTypes = {
  thread: PropTypes.object.isRequired,
  lastMessage: PropTypes.object.isRequired
};

export default LastMessage;
