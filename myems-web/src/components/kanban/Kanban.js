import React, { useContext, useEffect } from 'react';
// import { TouchBackend } from 'react-dnd-touch-backend';

import AppContext from '../../context/Context';
import KanbanHeader from './KanbanHeader';
import KanbanContainer from './KanbanContainer';
import KanbanProvider from './KanbanProvider';

const Kanban = () => {
  const { setIsNavbarVerticalCollapsed } = useContext(AppContext);

  useEffect(() => {
    document.getElementsByTagName('body')[0].classList.add('overflow-hidden');
    setIsNavbarVerticalCollapsed(true);
    return () => {
      document.getElementsByTagName('body')[0].classList.remove('overflow-hidden');
    };
  }, [setIsNavbarVerticalCollapsed]);

  return (
    <>
      <KanbanHeader />
      <KanbanProvider>
        <KanbanContainer />
      </KanbanProvider>
    </>
  );
};

export default Kanban;
