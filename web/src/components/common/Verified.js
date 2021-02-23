import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { UncontrolledTooltip } from 'reactstrap';
import uniqueId from 'lodash/uniqueId';

const Verified = ({ placement, id }) => {
  const verifiedUniqueId = id || uniqueId('verified_');

  return (
    <Fragment>
      <FontAwesomeIcon
        icon="check-circle"
        transform="shrink-4 down-2"
        id={verifiedUniqueId}
        className="text-primary ml-1"
      />
      <UncontrolledTooltip placement={placement} target={verifiedUniqueId}>
        Verified
      </UncontrolledTooltip>
    </Fragment>
  );
};

Verified.propTypes = {
  id: PropTypes.string,
  placement: PropTypes.string
};

Verified.defaultProps = { placement: 'top' };

export default Verified;
