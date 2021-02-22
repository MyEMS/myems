import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import Flex from '../../common/Flex';
import { Button, CardFooter } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomInput from 'reactstrap/es/CustomInput';
import AppContext from '../../../context/Context';

const InboxFooter = ({ meta, handler }) => {
  const { isRTL } = useContext(AppContext);
  const { total, itemsPerPage, from, to, nextPageNo, prevPageNo } = meta;
  const { nextPage, prevPage, perPage } = handler;

  return (
    <CardFooter tag={Flex} justify="between" align="center">
      <small>
        2.29 GB <span className="d-none d-sm-inline-block">(13%) </span> of 17 GB used
      </small>
      <div>
        <div className="d-inline-block mr-2">
          <CustomInput
            id="itemsPerPage"
            type="select"
            bsSize="sm"
            value={itemsPerPage}
            onChange={({ target }) => perPage(Number(target.value))}
          >
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={total}>All</option>
          </CustomInput>
        </div>
        <small>
          {from}-{to} of {total}
        </small>
        <Button color="falcon-default" size="sm" className="ml-1 ml-sm-2" onClick={prevPage} disabled={!prevPageNo}>
          <FontAwesomeIcon icon={`chevron-${isRTL ? 'right' : 'left'}`} />
        </Button>
        <Button color="falcon-default" size="sm" className="ml-1 ml-sm-2" onClick={nextPage} disabled={!nextPageNo}>
          <FontAwesomeIcon icon={`chevron-${isRTL ? 'left' : 'right'}`} />
        </Button>
      </div>
    </CardFooter>
  );
};

InboxFooter.propTypes = {
  meta: PropTypes.object.isRequired,
  handler: PropTypes.object.isRequired
};

export default InboxFooter;
