import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CustomInput } from 'reactstrap';
import FalconCardFooterLink from '../common/FalconCardFooterLink';
import FalconCardHeader from '../common/FalconCardHeader';
import RunningProject from './RunningProject';

const RunningProjects = ({ projects }) => (
  <Card className="h-lg-100">
    <FalconCardHeader title="Running Projects" titleTag="h6">
      <CustomInput type="select" id="exampleCustomSelect" bsSize="sm">
        <option>Working Time</option>
        <option>Estimated Time</option>
        <option>Billable Time</option>
      </CustomInput>
    </FalconCardHeader>
    <CardBody className="py-0">
      {projects.map((project, index) => (
        <RunningProject project={project} isLast={index === projects.length - 1} key={project.id} />
      ))}
    </CardBody>
    <FalconCardFooterLink title="Show all projects" to="#!" size="sm" borderTop={false} />
  </Card>
);

RunningProjects.propTypes = { projects: PropTypes.arrayOf(RunningProject.propTypes.project).isRequired };

export default RunningProjects;
