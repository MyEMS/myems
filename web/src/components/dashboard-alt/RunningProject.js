import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Media, Progress, Row, Col, Badge } from 'reactstrap';
import Flex from '../common/Flex';

const RunningProject = ({ project, isLast }) => {
  const { color, progress, time, title } = project;

  return (
    <Row className={classNames('align-items-center py-2', { 'border-bottom border-200 ': !isLast })}>
      <Col className="py-1">
        <Media className="align-items-center">
          <div className="avatar avatar-xl mr-3">
            <div className={`avatar-name rounded-circle bg-soft-${color}`}>
              <span className={`fs-0 text-${color}`}>{title[0]}</span>
            </div>
          </div>
          <Media body className="position-relative">
            <Flex tag="h6" align="center" className="mb-0">
              <a className="text-800 stretched-link" href="#!">
                {title}
              </a>
              <Badge pill className="ml-2 bg-200 text-primary">
                {progress}%
              </Badge>
            </Flex>
          </Media>
        </Media>
      </Col>
      <Col>
        <Row className="justify-content-end align-items-center">
          <Col xs="auto pr-0">
            <div className="fs--1 font-weight-semi-bold">{time}</div>
          </Col>
          <Col xs="5" className="pr-card">
            <Progress
              value={progress}
              color="primary"
              className="w-100 rounded-soft bg-200"
              barClassName="rounded-capsule"
              style={{ height: '5px' }}
            />
          </Col>
        </Row>
      </Col>
    </Row>
  );
};

RunningProject.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired
  }).isRequired,
  isLast: PropTypes.bool
};

RunningProject.defaultProps = { isLast: false };

export default RunningProject;
