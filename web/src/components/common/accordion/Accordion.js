import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardHeader, Collapse } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Accordion = ({ title, description, open }) => {
  const [isOpen, setIsOpen] = useState(open);
  return (
    <Card className="shadow-none border-bottom rounded-0">
      <CardHeader onClick={() => setIsOpen(!isOpen)} className="py-2 cursor-pointer">
        <FontAwesomeIcon icon="caret-right" transform={`rotate-${isOpen ? 90 : 0})`} />
        <span className="font-weight-medium text-dark text-sans-serif pl-2">{title}</span>
      </CardHeader>
      <Collapse isOpen={isOpen}>
        <CardBody className="pt-2">
          <div className="pl-3">{description}</div>
        </CardBody>
      </Collapse>
    </Card>
  );
};

Accordion.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  open: PropTypes.bool
};

Accordion.defaultProps = { open: false };

export default Accordion;
