import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import KanbanColumnHeder from './KanbanColumnHeader';
import { KanbanContext } from '../../context/Context';
import { Droppable } from 'react-beautiful-dnd';

import AddAnotherCard from './AddAnotherCard';
import users from '../../data/dashboard/users';
import ButtonIcon from '../common/ButtonIcon';
import TaskCard from './TaskCard';

const KanbanColumn = ({ kanbanColumnItem, index }) => {
  const { kanbanTaskCards } = useContext(KanbanContext);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const kanbanContainer = document.getElementById(`container-${index}`);
    kanbanContainer.scrollTop = kanbanContainer.scrollHeight;
  }, [showForm, index]);

  return (
    <div className={classNames('kanban-column', { 'form-added': showForm })}>
      <KanbanColumnHeder kanbanColumnItem={kanbanColumnItem} />
      <Droppable droppableId={kanbanColumnItem.id}>
        {(provided, snapshot) => (
          <>
            <div
              className="kanban-items-container scrollbar"
              id={`container-${index}`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {kanbanColumnItem.items.map((taskCardItemId, taskCardIndex) => {
                const taskCard = kanbanTaskCards.find(({ id }) => id === taskCardItemId);

                const taskCardImage = taskCard.attachments && taskCard.attachments.find(({ type }) => type === 'image');

                const members =
                  taskCard.members &&
                  taskCard.members.map(member => {
                    return users.find(user => member === user.id);
                  });

                return (
                  <TaskCard
                    members={members}
                    taskCardImage={taskCardImage}
                    taskCard={taskCard}
                    key={taskCardItemId}
                    taskCardIndex={taskCardIndex}
                    taskCardItemId={taskCardItemId}
                  />
                );
              })}
              {showForm && <AddAnotherCard kanbanColumnItem={kanbanColumnItem} setShowForm={setShowForm} />}
              {provided.placeholder}
            </div>
            {!showForm && (
              <div className="kanban-column-footer">
                <ButtonIcon
                  className="btn-add-card text-600 text-decoration-none"
                  color="link"
                  block
                  icon="plus"
                  iconClassName="mr-1"
                  size="sm"
                  onClick={() => {
                    setShowForm(true);
                  }}
                >
                  Add another card
                </ButtonIcon>
              </div>
            )}
          </>
        )}
      </Droppable>
    </div>
  );
};
KanbanColumn.propTypes = {
  kanbanColumnItem: PropTypes.object.isRequired
};
export default KanbanColumn;
