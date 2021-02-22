import React, { useContext } from 'react';
import { DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome/index';
import { isIterableArray } from '../../../helpers/utils';
import DropdownItemFilter from './DropdownItemFilter';
import { EmailContext } from '../../../context/Context';

const DropdownFilter = props => {
  // Context
  const { filters, handleFilter, currentFilter } = useContext(EmailContext);

  return (
    <UncontrolledDropdown>
      <DropdownToggle size="sm" color="falcon-default" {...props}>
        <FontAwesomeIcon icon="sliders-h" />
      </DropdownToggle>
      <DropdownMenu className="border py-2">
        {isIterableArray(filters) &&
          filters.map((filter, index) => (
            <DropdownItemFilter
              currentFilter={currentFilter}
              onClick={() => handleFilter(filter)}
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
};

export default DropdownFilter;
