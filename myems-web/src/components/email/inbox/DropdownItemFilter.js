import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { DropdownItem } from 'reactstrap';
import Flex from '../../common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome/index';
import classNames from 'classnames';

const DropdownItemFilter = ({ filter, currentFilter, className, children, ...rest }) => (
  <DropdownItem tag={Flex} justify="between" className={classNames('cursor-pointer', className)} {...rest}>
    <Fragment>{children}</Fragment>
    {filter === currentFilter && <FontAwesomeIcon icon="check" transform="down-4 shrink-4" />}
  </DropdownItem>
);

DropdownItemFilter.propTypes = {
  children: PropTypes.node.isRequired,
  filter: PropTypes.string.isRequired,
  currentFilter: PropTypes.string.isRequired
};

export default DropdownItemFilter;
