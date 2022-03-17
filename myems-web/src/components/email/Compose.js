import React, { Fragment, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Label,
  Input,
  Button,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip,
  Form
} from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import QuillEditor from '../common/QuillEditor';
import { toast } from 'react-toastify';
import { isIterableArray } from '../../helpers/utils';
import useFakeFetch from '../../hooks/useFakeFetch';
import Flex from '../common/Flex';
import ComposeAttachment from './ComposeAttachment';
import rawEmailAdresses from '../../data/email/emailAddresses';
import Select from '../common/Select';

const availableEmailAddresses = rawEmailAdresses
  .slice(0, 10)
  .map((emailAddress, index) => ({ value: index, label: emailAddress }));

const validateEmails = emails => {
  // eslint-disable-next-line
  const re = /^(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;

  if (isIterableArray(emails)) {
    return emails.map(email => re.test(String(email.label).toLowerCase())).every(isValid => isValid);
  }
  return isIterableArray(emails);
};

const rawAttachments = [
  { id: 1, name: 'winter.jpg', size: 893952, type: 'image/jpg' },
  { id: 2, name: 'coffee.zip', size: 350208, type: 'application/zip' }
];

const Compose = ({ recipientOption }) => {
  const { data: attachments, setData: setAttachments } = useFakeFetch(rawAttachments);
  const [isDisabled, setIsDisabled] = useState(true);
  const [content, setContent] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [subject, setSubject] = useState('');

  const handleDetachAttachment = id => setAttachments(attachments.filter(attachment => id !== attachment.id));

  const handleAddAttachment = files => {
    if (files.length === 0) return;
    const { name, size, type } = files[0];
    const newFile = {
      id: attachments.length + 1 + Date.now(),
      name,
      size,
      type
    };
    setAttachments([...attachments, newFile]);
  };

  const handleClear = () => {
    setContent('');
    setRecipients([]);
    setSubject('');
    setAttachments([]);
  };

  const handleSubmit = e => {
    e.preventDefault();
    toast(
      <Fragment>
        <h6>Subject: {subject}</h6>
        <hr />
        <p className="mb-0">An email is successfully sent to {recipients.length > 1 ? 'recipients' : 'recipient'}.</p>
      </Fragment>
    );
    handleClear();
  };

  useEffect(() => {
    setIsDisabled(!content || !validateEmails(recipients) || !subject);
  }, [content, recipients, subject]);

  return (
    <Fragment>
      <Card tag={Form} onSubmit={handleSubmit}>
        <CardHeader className="bg-light">
          <h5 className="mb-0">New message</h5>
        </CardHeader>
        <CardBody className="p-0">
          <div className="border-bottom border-200">
            <Select
              options={availableEmailAddresses}
              placeholder="Recipients"
              value={recipients}
              onChange={value => setRecipients(value)}
              {...recipientOption}
            />
          </div>
          <Input
            className="form-control border-0 outline-none px-card"
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={({ target }) => setSubject(target.value)}
            required
          />
          <QuillEditor value={content} onChange={setContent} style={{ height: 300, marginBottom: 44 }} />
          {isIterableArray(attachments) && (
            <div className="bg-light px-card py-3">
              <Flex column inline>
                {attachments.map(attachment => (
                  <ComposeAttachment
                    {...attachment}
                    key={attachment.id}
                    handleDetachAttachment={handleDetachAttachment}
                  />
                ))}
              </Flex>
            </div>
          )}
        </CardBody>
        <CardFooter tag={Flex} justify="between" className="border-top border-200">
          <Flex align="center">
            <Button color="primary" size="sm" className="px-5 mr-2" disabled={isDisabled} type="submit">
              Send
            </Button>
            <Label for="email-attachment" className="mr-2 btn btn-light btn-sm mb-0 cursor-pointer" id="AttachFiles">
              <FontAwesomeIcon icon="paperclip" className="fs-1" />
            </Label>
            <Input
              className="d-none"
              id="email-attachment"
              type="file"
              onChange={({ target }) => handleAddAttachment(target.files)}
            />
            <UncontrolledTooltip placement="top" target="AttachFiles">
              Attach files
            </UncontrolledTooltip>
          </Flex>
          <Flex align="center">
            <UncontrolledDropdown>
              <DropdownToggle className="btn btn-sm ml-2 text-600 py-2" color="link">
                <FontAwesomeIcon icon="ellipsis-v" />
              </DropdownToggle>
              <DropdownMenu right>
                <DropdownItem>Print</DropdownItem>
                <DropdownItem>Check spelling</DropdownItem>
                <DropdownItem>Plain text mode</DropdownItem>
                <DropdownItem divider />
                <DropdownItem>Archive</DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
            <Label id="delete" className="mr-2 btn btn-light btn-sm mb-0 cursor-pointer" onClick={handleClear}>
              <FontAwesomeIcon icon="trash" />
            </Label>
            <UncontrolledTooltip placement="top" target="delete">
              Delete
            </UncontrolledTooltip>
          </Flex>
        </CardFooter>
      </Card>
    </Fragment>
  );
};

Compose.propTypes = { recipientOption: PropTypes.object };

Compose.defaultProps = {
  recipientOption: {
    closeMenuOnSelect: false,
    autoFocus: true,
    isMulti: true,
    isCreatable: true
  }
};

export default Compose;
