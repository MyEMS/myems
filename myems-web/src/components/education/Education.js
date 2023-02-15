import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { isIterableArray } from '../../helpers/utils';
import { Card, CardBody, UncontrolledCollapse } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import EducationSummary from './EducationSummary';
import Loader from '../common/Loader';
import EducationForm from './EducationForm';
import Flex from '../common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useFakeFetch from '../../hooks/useFakeFetch';

const Education = ({ educations: rawEducations, isEditable, ...rest }) => {
  // Data
  const { loading: loadingEducations, data: educations, setData: setEducations } = useFakeFetch(rawEducations);

  return (
    <Card {...rest}>
      <FalconCardHeader title="Education" />
      <CardBody className="fs--1">
        {isEditable && (
          <Fragment>
            <Flex align="center" className="mb-4 text-primary cursor-pointer fs-0" id="togglerAddEducation">
              <span className="circle-dashed">
                <FontAwesomeIcon icon="plus" />
              </span>
              <span className="ml-3">Add new education</span>
            </Flex>
            <UncontrolledCollapse toggler="#togglerAddEducation">
              <EducationForm educations={educations} setEducations={setEducations} />
              <hr className="border-dashed border-bottom-0 my-4" />
            </UncontrolledCollapse>
          </Fragment>
        )}
        {loadingEducations ? (
          <Loader />
        ) : (
          isIterableArray(educations) &&
          educations.map((education, index) => <EducationSummary {...education} isEditable={isEditable} key={index} />)
        )}
      </CardBody>
    </Card>
  );
};

Education.propTypes = {
  educations: PropTypes.array,
  isEditable: PropTypes.bool
};

Education.defaultProps = { isEditable: false };

export default Education;
