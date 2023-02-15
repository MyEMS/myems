import React from 'react';
import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome/index';
import { isIterableArray } from '../../../helpers/utils';
import DropdownItemFilter from './DropdownItemFilter';

const DropdownFilter = ({ filters, handleFilter, currentFilter, icon, right, ...rest }) => (
  <UncontrolledDropdown>
    <DropdownToggle size="sm" color="falcon-default" {...rest}>
      {currentFilter && <span className="mr-2">{currentFilter}</span>}
      <FontAwesomeIcon icon={icon} />
    </DropdownToggle>
    <DropdownMenu className="border py-2" right={right}>
      {isIterableArray(filters) &&
        filters.map((filter, index) => (
          <DropdownItemFilter
            currentFilter={currentFilter}
            onClick={() => {
              handleFilter(filter);
            }}
            filter={filter}
            className="text-capitalize"
            key={index}
          >
            {filter}
          </DropdownItemFilter>
        ))}
    </DropdownMenu>
  </UncontrolledDropdown>
);

export default DropdownFilter;
