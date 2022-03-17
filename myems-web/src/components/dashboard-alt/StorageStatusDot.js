import React from 'react';
import PropTypes from 'prop-types';
import { Col } from 'reactstrap';
import Flex from '../common/Flex';
import classNames from 'classnames';
import Dot from '../common/Dot';

const StorageStatusDot = ({ name, size, color, isFirst, isLast }) => (
  <Col
    xs="auto"
    tag={Flex}
    align="center"
    className={classNames({
      'pr-2': isFirst,
      'px-2': !isFirst && !isLast,
      'pl-2': isLast
    })}
  >
    <Dot color={color} />
    <span>{name}</span>
    <span className="d-none d-md-inline-block d-lg-none d-xxl-inline-block ml-1">({size}MB)</span>
  </Col>
);

StorageStatusDot.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
  isFirst: PropTypes.bool,
  isLast: PropTypes.bool
};

StorageStatusDot.defaultProps = {
  isFirst: false,
  isLast: false
};

export default StorageStatusDot;
