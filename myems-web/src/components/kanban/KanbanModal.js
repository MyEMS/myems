import React from 'react';
import {
  Button,
  Modal,
  ModalBody,
  Row,
  Col,
  UncontrolledButtonDropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'reactstrap';
import Background from '../common/Background';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GroupMember from './GroupMember';
import users from '../../data/dashboard/users';
import ModalMediaContent from './ModalMediaContent';

import ModalLabelContent from './ModalLabelContent';
import ModalAttachmentsContent from './ModalAttachmentsContent';
import ModalCommentContent from './ModalCommentContetn';
import ModalActivityContent from './ModalActivityContent';
import ModalSideContent from './modalSideContent';

const KanbanModal = ({ modal, setModal, className, modalContent }) => {
  const { taskCardImage } = modalContent;

  const toggle = () => setModal(!modal);

  return (
    <Modal
      isOpen={modal}
      toggle={toggle}
      className={`mt-6 ${className ? className : ''}`}
      contentClassName="border-0"
      modalClassName="theme-modal"
      size="lg"
    >
      <ModalBody className="p-0">
        {taskCardImage && (
          <div className="position-relative overflow-hidden py-8">
            <Background image={taskCardImage.url} className="rounded-soft-top" />
          </div>
        )}
        <div className="bg-light rounded-soft-top px-4 py-3">
          <h4 className="mb-1">Add a new illustration to the landing page</h4>
          <p className="fs--2 mb-0">
            Added by{' '}
            <a href="#!" className="text-600 font-weight-semi-bold">
              Antony
            </a>
          </p>
        </div>
        <div className="position-absolute t-0 r-0  z-index-1">
          <Button
            size="sm"
            className="close close-circle d-flex flex-center transition-base mt-3 mr-3"
            onClick={() => toggle()}
          >
            <FontAwesomeIcon icon="times" transform="shrink-6 right-0.3 down-0.3" />
          </Button>
        </div>
        <div className="p-4">
          <Row>
            <Col lg="9">
              {/* //Group member */}
              <ModalMediaContent title="Reviewers" icon="user">
                <GroupMember users={users} addMember avatarSize="xl" />
              </ModalMediaContent>
              {/* //labels */}
              <ModalMediaContent title="Labels" icon="tag">
                <ModalLabelContent />
              </ModalMediaContent>
              {/* //description */}
              <ModalMediaContent title="Description" icon="paperclip">
                <p className="text-word-break fs--1">
                  The illustration must match to the contrast of the theme. The illustraion must described the concept
                  of the design. To know more about the theme visit the page.{' '}
                  <a
                    href="https://prium.github.io/falcon/undefined/default/home/dashboard-alt.html"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    https://prium.github.io/falcon//default/home/dashboard-alt.html
                  </a>
                </p>
              </ModalMediaContent>
              {/* //Attachment */}
              <ModalMediaContent
                title="Attachments"
                icon="paperclip"
                headingClass="d-flex justify-content-between"
                headingContent={
                  <UncontrolledButtonDropdown direction="right">
                    <DropdownToggle caret size="sm" color="falcon-default" className="dropdown-caret-none fs--2">
                      <FontAwesomeIcon icon="plus" />
                    </DropdownToggle>
                    <DropdownMenu>
                      <DropdownItem>Computer</DropdownItem>
                      <DropdownItem>Google Drive</DropdownItem>
                      <DropdownItem divider />
                      <DropdownItem>Attach Link</DropdownItem>
                    </DropdownMenu>
                  </UncontrolledButtonDropdown>
                }
              >
                <ModalAttachmentsContent />
              </ModalMediaContent>
              {/* //Comment */}
              <ModalMediaContent title="Comments" icon={['far', 'comment']} headingClass="mb-3">
                <ModalCommentContent />
              </ModalMediaContent>
              {/* //Activity */}
              <ModalMediaContent title="Activity" icon="list-ul" headingClass="mb-3" isHr={false}>
                <ModalActivityContent />
              </ModalMediaContent>
            </Col>
            {/* //sideContent */}
            <Col lg="3">
              <ModalSideContent />
            </Col>
          </Row>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default KanbanModal;
