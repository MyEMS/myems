import React, { useContext } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import {
  Card,
  CardBody,
  Badge,
  CardImg,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledTooltip
} from 'reactstrap';

import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { KanbanContext } from '../../context/Context';

const TaskCard = ({ taskCardItemId, taskCard, taskCardImage, members, taskCardIndex }) => {
  const { getItemStyle, setModalContent, setModal } = useContext(KanbanContext);
  return (
    <Draggable draggableId={`draggableId${taskCardItemId}`} index={taskCardIndex}>
      {(provided, snapshot) => (
        <div
          className="kanban-item"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={provided.draggableProps.style}
        >
          <Card
            className="kanban-item-card hover-actions-trigger "
            style={getItemStyle(snapshot.isDragging)}
            onClick={() => {
              setModalContent({ taskCard, taskCardImage });
              setModal(true);
            }}
          >
            {taskCardImage && (
              <CardImg
                top
                width="100%"
                src={taskCardImage.url}
                className="overflow-hidden position-relative"
                alt="Card image cap"
              />
            )}

            <CardBody>
              {taskCard.labels && (
                <div className="mb-2">
                  {taskCard.labels.map((label, index) => (
                    <Badge className={`badge-soft-${label.color} d-inline-block py-1 mr-1 mb-1`} key={index + 10}>
                      {label.text}
                    </Badge>
                  ))}
                </div>
              )}
              <p
                className="mb-0 font-weight-medium text-sans-serif"
                dangerouslySetInnerHTML={{ __html: taskCard.title }}
              />
              {(taskCard.members || taskCard.attachments || taskCard.checklist) && (
                <div className="kanban-item-footer">
                  <div className="text-500">
                    {taskCard.members && members.find(member => member.id === 1) && (
                      <>
                        <FontAwesomeIcon icon="eye" className="mr-2" id={`cardId-${taskCard.id}`} transform="grow-1" />
                        <UncontrolledTooltip target={`cardId-${taskCard.id}`}>
                          You're assigned in this card
                        </UncontrolledTooltip>
                      </>
                    )}
                    {taskCard.attachments && (
                      <span id={`attachments-${taskCard.id}`} className="mr-2">
                        <FontAwesomeIcon icon="paperclip" className="mr-1" />
                        <span>{taskCard.attachments.length}</span>
                        <UncontrolledTooltip target={`attachments-${taskCard.id}`}>Attachments</UncontrolledTooltip>
                      </span>
                    )}
                    {taskCard.checklist && (
                      <span id={`Checklist-${taskCard.id}`}>
                        <FontAwesomeIcon icon="check" className="mr-1" />
                        <span>
                          {taskCard.checklist.completed}/{taskCard.checklist.totalCount}
                        </span>
                        <UncontrolledTooltip target={`Checklist-${taskCard.id}`}>Checklist</UncontrolledTooltip>
                      </span>
                    )}
                  </div>
                  <div>
                    {taskCard.members &&
                      members.map((member, index) => (
                        <Link
                          to="#!"
                          className={index > 0 ? 'ml-n1 p-0' : 'p-0'}
                          key={index}
                          id={`member-${member.id}-${taskCard.id}`}
                        >
                          <Avatar src={member.avatar.src} size="l" />
                          <UncontrolledTooltip target={`member-${member.id}-${taskCard.id}`}>
                            {member.name}
                          </UncontrolledTooltip>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
              <UncontrolledDropdown
                className="position-absolute text-sans-serif t-0 r-0 mt-card mr-card hover-actions"
                onClick={e => {
                  e.stopPropagation();
                }}
              >
                <DropdownToggle color="falcon-default" size="sm" className="py-0 px-2">
                  <FontAwesomeIcon icon="ellipsis-h" />
                </DropdownToggle>
                <DropdownMenu right className="py-0">
                  <DropdownItem>Add Card</DropdownItem>
                  <DropdownItem>Edit</DropdownItem>
                  <DropdownItem>Copy link</DropdownItem>
                  <DropdownItem divider />
                  <DropdownItem className="text-danger">Remove</DropdownItem>
                </DropdownMenu>
              </UncontrolledDropdown>
            </CardBody>
          </Card>
        </div>
      )}
    </Draggable>
  );
};

export default TaskCard;
