import React from 'react';
import PropTypes from 'prop-types';
import Accordion from './Accordion';
import { isIterableArray } from '../../../helpers/utils';

const Accordions = ({ items, titleKey, descriptionKey, isOpenKey }) => {
  return (
    <div className="border-x border-top">
      {isIterableArray(items) &&
        items.map((item, index) => (
          <Accordion title={item[titleKey]} description={item[descriptionKey]} key={index} open={!!item[isOpenKey]} />
        ))}
    </div>
  );
};

Accordions.propTypes = {
  items: PropTypes.array.isRequired,
  titleKey: PropTypes.string.isRequired,
  descriptionKey: PropTypes.string.isRequired,
  isOpenKey: PropTypes.string
};

export default Accordions;
