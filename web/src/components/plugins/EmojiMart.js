import React from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import PageHeader from '../common/PageHeader';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import AppContext from '../../context/Context';
import { getGrays } from '../../helpers/utils';

const EmojiMart = () => {
  const emojiMartCode = `function() {
    const [previewEmojiTextarea, setPreviewEmojiTextarea] = useState(false);
    const { isDark } = useContext(AppContext);
    const [message, setMessage] = useState('');

    const addEmoji = e => {
      let emoji = e.native;
      setMessage(message + emoji);
    };
  
    return (
      <Form className="position-relative">
        <Input
          className="resize-none"
          type="textarea"
          rows="6"
          placeholder="Type your message"
          value={message}
          onChange={({ target }) => setMessage(target.value)}
        />
        <FontAwesomeIcon
          icon={['far', 'laugh-beam']}
          transform="grow-5"
          style={{
            position: 'absolute',
            bottom: '6%',
            right: '1%',
            cursor: 'pointer'
          }}
          onClick={() => setPreviewEmojiTextarea(!previewEmojiTextarea)}
        />
        {previewEmojiTextarea && (
          <Picker
            set="google"
            onSelect={addEmoji}
            sheetSize={20}
            style={{
              position: 'absolute',
              bottom: '24%',
              right: '1%',
              padding: 0,
              zIndex: 1,
              backgroundColor: getGrays(isDark)[100]
            }}
            theme={isDark ? 'dark' : 'light'}
            showPreview={false}
            showSkinTones={false}
          />
        )}
      </Form>
  )
   
}`;

  return (
    <>
      <PageHeader
        title="Emoji Mart"
        description="Emoji Mart is a Slack-like customizable
        emoji picker component for React"
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://github.com/missive/emoji-mart"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          Emoji Mart Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card>
        <FalconCardHeader title="Example In Textarea" />
        <CardBody>
          <FalconEditor code={emojiMartCode} scope={{ AppContext, FontAwesomeIcon, Picker, getGrays }} language="jsx" />
        </CardBody>
      </Card>
    </>
  );
};

export default EmojiMart;
