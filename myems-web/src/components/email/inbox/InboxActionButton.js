import React from 'react';
import PropTypes from 'prop-types';
import { Button, UncontrolledTooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const InboxActionButton = ({ id, icon, children, ...rest }) => (
  <Button id={id} {...rest}>
    <UncontrolledTooltip placement="top" target={id}>
      {children}
    </UncontrolledTooltip>
    <FontAwesomeIcon icon={icon} />
  </Button>
);

InboxActionButton.propTypes = {
  id: PropTypes.string.isRequired,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  children: PropTypes.node.isRequired
};

export default InboxActionButton;
