import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { isIterableArray } from '../../helpers/utils';
import { Card, CardBody, Collapse } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import ExperienceSummary from './ExperienceSummary';
import classNames from 'classnames';
import Loader from '../common/Loader';
import ExperienceForm from './ExperienceForm';
import Flex from '../common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useFakeFetch from '../../hooks/useFakeFetch';

const Experience = ({ experiences: rawExperiences, isEditable, isOpen, ...rest }) => {
  // Data
  const { loading: loadingExperiences, data: experiences, setData: setExperiences } = useFakeFetch(rawExperiences);

  const [collapse, setCollapse] = useState(isOpen);

  return (
    <Card {...rest}>
      <FalconCardHeader title="Experience" light={!isEditable} />
      <CardBody className={classNames('fs--1', { 'bg-light': isEditable })}>
        {isEditable && (
          <Fragment>
            <Flex
              align="center"
              className="mb-4 text-primary cursor-pointer fs-0"
              id="togglerAddExperience"
              onClick={() => {
                setCollapse(!collapse);
              }}
            >
              <span className="circle-dashed">
                <FontAwesomeIcon icon="plus" />
              </span>
              <span className="ml-3">Add new experience</span>
            </Flex>
            <Collapse toggler="#togglerAddExperience" isOpen={collapse}>
              <ExperienceForm experiences={experiences} setExperiences={setExperiences} />
              <hr className="border-dashed border-bottom-0 my-4" />
            </Collapse>
          </Fragment>
        )}
        {loadingExperiences ? (
          <Loader />
        ) : (
          isIterableArray(experiences) &&
          experiences.map((experience, index) => (
            <ExperienceSummary {...experience} isEditable={isEditable} key={index} />
          ))
        )}
      </CardBody>
    </Card>
  );
};

Experience.propTypes = {
  experiences: PropTypes.array,
  isEditable: PropTypes.bool,
  isOpen: PropTypes.bool
};

Experience.defaultProps = { isEditable: false, isOpen: false };

export default Experience;
