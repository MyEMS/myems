import React, { Fragment } from 'react';
import QuillEditor from '../common/QuillEditor';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';
import FalconCardHeader from '../common/FalconCardHeader';

const quillEditorCode = `function QuillEditorExample() {
  const [content, setContent] = useState('');
  
  return (
    <QuillEditor
      value={content}
      onChange={setContent}
      style={{ height: 300, marginBottom: 44 }}
    />
  );
}`;

const QuillEditorExample = () => {
  return (
    <Fragment>
      <PageHeader
        title="WYSIWYG Editor"
        description="Quill is a free, open source WYSIWYG editor built for the modern web. With its modular architecture and expressive API, it is completely customizable to fit any need."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://github.com/zenoamaro/react-quill"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          React Quill Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card>
        <FalconCardHeader title="Example" />
        <CardBody className="p-0 overflow-hidden">
          <FalconEditor code={quillEditorCode} scope={{ QuillEditor }} />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default QuillEditorExample;
