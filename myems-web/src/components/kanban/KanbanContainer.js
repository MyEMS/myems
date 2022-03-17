import React, { useContext, useRef, useEffect } from 'react';
import { DragDropContext } from 'react-beautiful-dnd';
import is from 'is_js';

import { KanbanContext } from '../../context/Context';
import { isIterableArray } from '../../helpers/utils';
import KanbanColumn from './KanbanColumn';
import AddAnotherList from './AddAnotherList';
import KanbanModal from './KanbanModal';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

  return result;
};

const KanbanContainer = () => {
  const { kanbanColumns, UpdateColumnData, modalContent, modal, setModal } = useContext(KanbanContext);
  const containerRef = useRef(null);

  // Detect device
  useEffect(() => {
    if (is.ipad()) {
      containerRef.current.classList.add('ipad');
    }
    if (is.mobile()) {
      containerRef.current.classList.add('mobile');
      if (is.safari()) {
        containerRef.current.classList.add('safari');
      }
      if (is.chrome()) {
        containerRef.current.classList.add('chrome');
      }
    }
  }, []);

  const getList = id => {
    const targetColumn = kanbanColumns.find(item => item.id === id);
    return targetColumn.items;
  };

  const onDragEnd = result => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(getList(source.droppableId), source.index, destination.index);
      const column = kanbanColumns.find(item => item.id === source.droppableId);
      // update individual column
      UpdateColumnData(column, items);
    } else {
      const result = move(getList(source.droppableId), getList(destination.droppableId), source, destination);

      const sourceColumn = kanbanColumns.find(item => item.id === source.droppableId);
      const destinationColumn = kanbanColumns.find(item => item.id === destination.droppableId);
      // update source
      UpdateColumnData(sourceColumn, result[source.droppableId]);

      //destination update
      UpdateColumnData(destinationColumn, result[destination.droppableId]);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="kanban-container scrollbar" ref={containerRef}>
        {isIterableArray(kanbanColumns) &&
          kanbanColumns.map((kanbanColumnItem, index) => {
            return <KanbanColumn kanbanColumnItem={kanbanColumnItem} key={index} index={index} />;
          })}
        <AddAnotherList />
        <KanbanModal modal={modal} setModal={setModal} modalContent={modalContent} />
      </div>
    </DragDropContext>
  );
};

export default KanbanContainer;
