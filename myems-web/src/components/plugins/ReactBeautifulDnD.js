import React, { Fragment } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import PageHeader from '../common/PageHeader';
import { Button, Card, CardBody, CardHeader, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import FalconEditor from '../common/FalconEditor';
import { useState } from 'react';

const DragAndDropCode = `function DragAndDropExample() {

  return (
    <DragDropContext onDragEnd={onDragEnd} >
      <Row>
        <Col>
        <h5>List 1</h5>
        <Droppable droppableId="droppable">
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}>
                {data.items.map((item, index) => (
                    <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                )}>
                                {item.content}
                            </div>
                        )}
                    </Draggable>
                ))}
                {provided.placeholder}
            </div>
            )}
         </Droppable>
        </Col>
        <Col>
        <h5>List 2</h5>
        <Droppable droppableId="droppable2">
        {(provided, snapshot) => (
            <div
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}>
                {data.selected.map((item, index) => (
                    <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={getItemStyle(
                                    snapshot.isDragging,
                                    provided.draggableProps.style
                                )}>
                                {item.content}
                            </div>
                        )}
                    </Draggable>
                ))}
                {provided.placeholder}
            </div>
           )}
          </Droppable>
        </Col>
      </Row>
</DragDropContext>)
}`;

const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k + offset}`,
    content: `item ${k + offset}`
  }));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

/**
 * Moves an item from one list to another list.
 */
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

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : '#FFF',

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 250
});

const ReactBootstrapTable2 = () => {
  const [data, setData] = useState({ items: getItems(10), selected: getItems(5, 10) });

  const id2List = {
    droppable: 'items',
    droppable2: 'selected'
  };

  const getList = id => data[id2List[id]];

  const onDragEnd = result => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const reorderData = reorder(getList(source.droppableId), source.index, destination.index);

      setData({ items: reorderData, selected: data.selected });

      if (source.droppableId === 'droppable2') {
        setData({ ...data, selected: reorderData });
      }
    } else {
      const result = move(getList(source.droppableId), getList(destination.droppableId), source, destination);

      setData({
        items: result.droppable,
        selected: result.droppable2
      });
    }
  };

  return (
    <Fragment>
      <PageHeader
        title="React Beautiful DnD"
        description="Intuitive to use.
        Compatible for Bootstrap 3 and 4.
        Better than legacy react-bootstrap-table!!. It has Rich Functionality - Sortable, Row Selection, Cell Editor, Row Expand, Column Filter Pagination etc. Easy to Configurable and customizable table."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://github.com/atlassian/react-beautiful-dnd"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          React Beautiful DnD Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card>
        <CardHeader className="bg-light">
          <h4 className="mb-0">Example</h4>
        </CardHeader>
        <CardBody>
          <Row>
            <Col>
              <FalconEditor
                code={DragAndDropCode}
                scope={{ DragDropContext, Droppable, Draggable, data, setData, onDragEnd, getListStyle, getItemStyle }}
                language="jsx"
              />
              {/* <PurchasesTable /> */}
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default ReactBootstrapTable2;
