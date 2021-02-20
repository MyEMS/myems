import React from 'react';
import Avatar from '../../common/Avatar';
import LockScreenForm from '../LockScreenForm';
import team1 from '../../../assets/img/team/1.jpg';
import AuthCardLayout from '../../../layouts/AuthCardLayout';
import { Link } from 'react-router-dom';
import { Col, Media, Row } from 'reactstrap';

const LockScreen = () => {
  return (
    <AuthCardLayout
      leftSideContent={
        <p className="mb-0 mt-4 mt-md-5 fs--1 font-weight-semi-bold text-300">
          Read our{' '}
          <Link className="text-underline text-300" to="#!">
            terms
          </Link>{' '}
          and{' '}
          <Link className="text-underline text-300" to="#!">
            conditions{' '}
          </Link>
        </p>
      }
    >
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
    </AuthCardLayout>
  );
};

export default LockScreen;
