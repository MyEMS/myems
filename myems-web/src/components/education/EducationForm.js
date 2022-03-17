import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getDuration } from '../../helpers/utils';
import { Button, Col, CustomInput, Form, FormGroup, Row } from 'reactstrap';
import EducationInput from './EducationInput';

const EducationForm = ({ educations, setEducations }) => {
  // State
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [field, setField] = useState('');
  const [location, setLocation] = useState('');
  // const [description, setDescription] = useState('');
  const [current, setCurrent] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isButtonDisable, setIsButtonDisable] = useState(true);

  const handleSubmit = e => {
    e.preventDefault();
    const newEducation = {
      imgSrc: '',
      institution: school,
      degree,
      duration: getDuration(startDate, endDate),
      location,
      to: '#!'
    };

    setEducations([newEducation, ...educations]);
    setSchool('');
    setDegree('');
    setField('');
    setLocation('');
    setCurrent(false);
    setStartDate('');
    setEndDate('');
  };

  useEffect(() => {
    setIsButtonDisable(!(school && degree && field && location && startDate && (current || endDate)));
  }, [school, degree, field, location, current, startDate, endDate]);

  return (
    <Form onSubmit={handleSubmit}>
      <EducationInput id="school" label="School" value={school} onChange={({ target }) => setSchool(target.value)} />

      <EducationInput id="degree" label="Degree" value={degree} onChange={({ target }) => setDegree(target.value)} />

      <EducationInput id="field" label="Field" value={field} onChange={({ target }) => setField(target.value)} />

      <EducationInput
        id="location"
        label="Location"
        value={location}
        onChange={({ target }) => setLocation(target.value)}
      />

      <FormGroup>
        <Row className="row">
          <Col lg={{ size: 7, offset: 3 }}>
            <CustomInput
              type="checkbox"
              id="education-current"
              label="I currently work here"
              checked={current}
              onChange={({ target }) => setCurrent(target.checked)}
              inline
            />
          </Col>
        </Row>
      </FormGroup>

      <EducationInput
        id="educationFrom"
        label="From"
        value={startDate}
        onChange={setStartDate}
        type="datetime"
        timeFormat={false}
      />

      {!current && (
        <EducationInput
          id="educationTo"
          label="To"
          value={endDate}
          onChange={setEndDate}
          type="datetime"
          timeFormat={false}
        />
      )}

      <FormGroup className="form-group">
        <Row className="row">
          <Col lg={{ size: 7, offset: 3 }}>
            <Button color="primary" disabled={isButtonDisable}>
              Save
            </Button>
          </Col>
        </Row>
      </FormGroup>
    </Form>
  );
};

EducationForm.propTypes = {
  educations: PropTypes.array.isRequired,
  setEducations: PropTypes.func.isRequired
};

export default EducationForm;
