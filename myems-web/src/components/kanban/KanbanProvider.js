import React, { useReducer, useState } from 'react';
import { KanbanContext } from '../../context/Context';
import { arrayReducer } from '../../reducers/arrayReducer';

import rawKanbanItems, { rawItems } from '../../data/kanban/kanbanItems';

const KanbanProvider = ({ children }) => {
  const [kanbanColumns, kanbanColumnsDispatch] = useReducer(arrayReducer, rawKanbanItems);
  const [kanbanTaskCards, kanbanTaskCardsDispatch] = useReducer(arrayReducer, rawItems);

  const [modal, setModal] = useState(false);

  const [modalContent, setModalContent] = useState({});

  const getItemStyle = isDragging => ({
    // change background colour if dragging
    cursor: isDragging ? 'grabbing' : 'pointer',
    transform: isDragging ? 'rotate(-3deg)' : '',
    transition: 'all 0.3s ease-out'

    // styles we need to apply on draggables
  });

  const UpdateColumnData = (column, items) => {
    kanbanColumnsDispatch({
      type: 'EDIT',
      payload: {
        ...column,
        items
      },
      id: column.id
    });
  };

  const value = {
    kanbanTaskCards,
    kanbanTaskCardsDispatch,
    kanbanColumns,
    kanbanColumnsDispatch,
    getItemStyle,
    UpdateColumnData,
    modalContent,
    setModalContent,
    modal,
    setModal
  };
  return <KanbanContext.Provider value={value}>{children}</KanbanContext.Provider>;
};

export default KanbanProvider;
