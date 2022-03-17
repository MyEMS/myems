import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getDuration } from '../../helpers/utils';
import moment from './Experience';
import { Button, Col, CustomInput, Form, FormGroup, Row } from 'reactstrap';
import ExperienceInput from './ExperienceInput';

const ExperienceForm = ({ experiences, setExperiences }) => {
  // State
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [current, setCurrent] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isButtonDisable, setIsButtonDisable] = useState(true);

  const handleSubmit = e => {
    e.preventDefault();
    const newExperience = {
      company,
      startDate,
      endDate,
      description,
      current,
      duration: getDuration(startDate, endDate),
      headline: position,
      location: city,
      to: '#!'
    };

    setExperiences([newExperience, ...experiences]);
    setCompany('');
    setPosition('');
    setCity('');
    setDescription('');
    setCurrent(false);
    setStartDate('');
    setEndDate('');
  };

  useEffect(() => {
    setIsButtonDisable(
      !(
        company &&
        position &&
        city &&
        description &&
        moment.isMoment(startDate) &&
        (current || moment.isMoment(endDate))
      )
    );
  }, [company, position, city, description, current, startDate, endDate]);

  return (
    <Form onSubmit={handleSubmit}>
      <ExperienceInput
        id="company"
        label="Company"
        value={company}
        onChange={({ target }) => setCompany(target.value)}
      />

      <ExperienceInput
        id="position"
        label="Position"
        value={position}
        onChange={({ target }) => setPosition(target.value)}
      />

      <ExperienceInput id="city" label="City" value={city} onChange={({ target }) => setCity(target.value)} />

      <ExperienceInput
        id="experienceDescription"
        label="Description"
        value={description}
        onChange={({ target }) => setDescription(target.value)}
        type="textarea"
        rows={3}
      />

      <FormGroup>
        <Row className="row">
          <Col lg={{ size: 7, offset: 3 }}>
            <CustomInput
              type="checkbox"
              id="current"
              label="I currently work here"
              checked={current}
              onChange={({ target }) => setCurrent(target.checked)}
              inline
            />
          </Col>
        </Row>
      </FormGroup>

      <ExperienceInput
        id="experienceFrom"
        label="From"
        value={startDate}
        onChange={setStartDate}
        type="datetime"
        timeFormat={false}
        closeOnSelect
      />

      {!current && (
        <ExperienceInput
          id="experienceTo"
          label="To"
          value={endDate}
          onChange={setEndDate}
          type="datetime"
          timeFormat={false}
          closeOnSelect
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

ExperienceForm.propTypes = {
  experiences: PropTypes.array,
  setExperiences: PropTypes.func.isRequired
};

export default ExperienceForm;
