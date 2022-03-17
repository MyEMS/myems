import React, { useContext, useState } from 'react';
import { KanbanContext } from '../../context/Context';
import { Button, Form, Input, Row, Col } from 'reactstrap';

const AddAnotherCard = ({ kanbanColumnItem, setShowForm }) => {
  const { kanbanColumnsDispatch, kanbanTaskCards, kanbanTaskCardsDispatch } = useContext(KanbanContext);

  const [cardHeaderTitle, setCardHeaderTitle] = useState('');

  const handleAddCard = value => {
    const item = {
      id: kanbanTaskCards.length + 1,
      title: value
    };

    kanbanTaskCardsDispatch({
      type: 'ADD',
      payload: item,
      id: item.id
    });

    kanbanColumnsDispatch({
      type: 'EDIT',
      payload: { ...kanbanColumnItem, items: [...kanbanColumnItem.items, item.id] },
      id: kanbanColumnItem.id
    });
  };

  const handleSubmit = e => {
    e.preventDefault();
    handleAddCard(cardHeaderTitle);
    setShowForm(false);
    setCardHeaderTitle('');
  };
  return (
    <div className="p-3 border bg-white rounded-soft transition-none mt-3">
      <Form onSubmit={e => handleSubmit(e)}>
        <Input
          type="textarea"
          placeholder="Enter a title for this card..."
          className="mb-2 add-card"
          value={cardHeaderTitle}
          autoFocus
          onChange={({ target }) => {
            setCardHeaderTitle(target.value);
          }}
        />
        <Row form className="mt-2">
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
                setCardHeaderTitle('');
              }}
            >
              Cancel
            </Button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default AddAnotherCard;
