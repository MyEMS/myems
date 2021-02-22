import React from 'react';
import PropTypes from 'prop-types';
import FalconCardFooterLink from '../common/FalconCardFooterLink';
import CardDropdown from './CardDropdown';
import FalconCardHeader from '../common/FalconCardHeader';
import { Card, CardBody } from 'reactstrap';
import ActiveUser from './ActiveUser';
import { isIterableArray } from '../../helpers/utils';

const ActiveUsers = ({ users }) => {
  return (
    <Card>
      <FalconCardHeader title="Active Users" titleTag="h6" className="py-2">
        <CardDropdown />
      </FalconCardHeader>
      <CardBody className="py-2">
        {isIterableArray(users) && users.map(({ id, ...rest }) => <ActiveUser {...rest} key={id} />)}
      </CardBody>
      <FalconCardFooterLink title="All active users" to="/pages/people" borderTop={false} />
    </Card>
  );
};

ActiveUsers.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      ...ActiveUser.propTypes
    })
  ).isRequired
};

export default ActiveUsers;
