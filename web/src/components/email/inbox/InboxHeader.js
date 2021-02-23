import React, { Fragment, useContext } from 'react';
import PropTypes from 'prop-types';
import { Button, CardHeader, Col, CustomInput, Row } from 'reactstrap';
import Flex from '../../common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DropdownFilter from './DropdownFilter';
import InboxBulkActions from './InboxBulkActions';
import { Link } from 'react-router-dom';
import { EmailContext } from '../../../context/Context';

const InboxHeader = ({ isAllSelected, toggleIsAllSelected, selectedItems, isIndeterminate }) => {
  // Context
  const { handleFilter } = useContext(EmailContext);

  return (
    <CardHeader>
      <Row>
        <Col tag={Flex} align="center">
          <CustomInput
            id="checkbox-bulk"
            type="checkbox"
            checked={isAllSelected}
            onChange={() => toggleIsAllSelected()}
            innerRef={input => input && (input.indeterminate = isIndeterminate)}
          />

          {isAllSelected || isIndeterminate ? (
            <InboxBulkActions selectedItems={selectedItems} />
          ) : (
            <Fragment>
              <Button color="falcon-default" className="btn-sm ml-sm-1" onClick={() => handleFilter('all')}>
                <FontAwesomeIcon icon="redo" />
              </Button>
              <DropdownFilter className="ml-2" />
            </Fragment>
          )}
        </Col>
        <Col xs="auto">
          <Button tag={Link} color="falcon-primary" size="sm" to="/email/compose">
            <FontAwesomeIcon icon="plus" transform="shrink-3" className="mr-1" />
            Compose new
          </Button>
        </Col>
      </Row>
    </CardHeader>
  );
};

InboxHeader.propTypes = {
  isAllSelected: PropTypes.bool.isRequired,
  toggleIsAllSelected: PropTypes.func.isRequired,
  selectedItems: PropTypes.array.isRequired
};

export default InboxHeader;
