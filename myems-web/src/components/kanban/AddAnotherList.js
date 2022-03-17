import React, { useContext, useState } from 'react';
import { KanbanContext } from '../../context/Context';
import { Button, Form, Input, Row, Col } from 'reactstrap';
import ButtonIcon from '../common/ButtonIcon';

const AddAnotherList = () => {
  const { kanbanColumns, kanbanColumnsDispatch } = useContext(KanbanContext);

  const [showForm, setShowForm] = useState(false);
  const [columnHeaderTitle, setColumnHeaderTitle] = useState('');

  const handleAddColumn = value => {
    kanbanColumnsDispatch({
      type: 'ADD',
      payload: { id: `${kanbanColumns.length + 1}`, name: value, items: [] },
      id: kanbanColumns.length + 1
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    handleAddColumn(columnHeaderTitle);
    setShowForm(false);
    setColumnHeaderTitle('');
  };

  return (
    <div className="kanban-column mr-3">
      {showForm ? (
        <div className="bg-100 p-card rounded-soft transition-none">
          <Form onSubmit={e => handleSubmit(e)}>
            <Input
              type="textarea"
              placeholder="Enter list title..."
              className="mb-2 add-list"
              value={columnHeaderTitle}
              autoFocus
              onChange={({ target }) => {
                setColumnHeaderTitle(target.value);
              }}
            />
            <Row form>
              <Col>
                <Button color="primary" size="sm" block type="submit">
                  Add
                </Button>
              </Col>
              <Col>
                <Button
                  color="outline-secondary"
                  size="sm"
                  block
                  className="border-400"
                  onClick={() => {
                    setShowForm(false);
                    setColumnHeaderTitle('');
                  }}
                >
                  Cancel
                </Button>
              </Col>
            </Row>
          </Form>
        </div>
      ) : (
        <ButtonIcon
          className="bg-400 border-400"
          color="secondary"
          block
          icon="plus"
          iconClassName="mr-1"
          onClick={() => {
            setShowForm(true);
          }}
        >
          Add another list
        </ButtonIcon>
      )}
    </div>
  );
};

export default AddAnotherList;
