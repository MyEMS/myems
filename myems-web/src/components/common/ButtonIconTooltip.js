import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import ButtonIcon from './ButtonIcon';
import { UncontrolledTooltip } from 'reactstrap';

const ButtonIconTooltip = ({ id, placement, children, ...rest }) => (
  <Fragment>
    <ButtonIcon id={id} {...rest} />
    <UncontrolledTooltip placement={placement} target={id}>
      {children}
    </UncontrolledTooltip>
  </Fragment>
);

ButtonIconTooltip.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  children: PropTypes.node.isRequired,
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

ButtonIconTooltip.defaultProps = { color: 'falcon-default', size: 'sm', placement: 'bottom' };

export default ButtonIconTooltip;
