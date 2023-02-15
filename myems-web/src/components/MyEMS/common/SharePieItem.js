import React from 'react';
import PropTypes from 'prop-types';
import Flex from '../../common/Flex';
import Dot from '../../common/Dot';

const SharePieItem = ({ color, name, value, totalShare }) => (
  <Flex justify="between" align="center" className="mb-1">
    <Flex align="center">
      <Dot style={{ backgroundColor: color }} />
      <span className="font-weight-semi-bold">{name}</span>
    </Flex>
    <div className="d-xxl-flex">{((value * 100) / totalShare).toFixed(2)}%</div>
  </Flex>
);

SharePieItem.propsType = {
  color: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  totalShare: PropTypes.number.isRequired
};

export default SharePieItem;
