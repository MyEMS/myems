import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Avatar from '../../common/Avatar';
import LockScreenForm from '../LockScreenForm';
import { Col, Media, Row } from 'reactstrap';
import withAuthSplit from '../../../hoc/withAuthSplit';

import team1 from '../../../assets/img/team/1.jpg';
import bgImg from '../../../assets/img/generic/18.jpg';

const LockScreen = ({ setBgProps }) => {
  useEffect(() => setBgProps({ image: bgImg }), [setBgProps]);

  return (
    <Row className="justify-content-center">
      <Col xs="auto">
        <Media className="align-items-center">
          <Avatar src={team1} size="4xl" className="mr-4" />
          <Media body>
            <h4>Hi! Emma</h4>
            <p className="mb-0">
              Enter your password <br />
              to access the admin.
            </p>
          </Media>
        </Media>
        <LockScreenForm className="mt-4" />
      </Col>
    </Row>
  );
};

LockScreen.propTypes = { setBgProps: PropTypes.func.isRequired };

export default withAuthSplit(LockScreen);
