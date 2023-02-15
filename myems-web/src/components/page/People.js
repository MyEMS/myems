import React from 'react';
import PropTypes from 'prop-types';
import { Alert, Card, CardBody, Col, CustomInput, Form, Input, Row } from 'reactstrap';
import Member from './Member';
import Loader from '../common/Loader';
import FalconCardHeader from '../common/FalconCardHeader';
import { isIterableArray } from '../../helpers/utils';
import useFakeFetch from '../../hooks/useFakeFetch';
import rawPeople from '../../data/people/people';
import peopleCategories from '../../data/people/peopleCategories';

const People = ({ peoples = rawPeople.length, className }) => {
  const { loading, data: people, setData: setPeople } = useFakeFetch(rawPeople);

  const searchPeople = ({ target }) => {
    const keyword = target.value.toLowerCase();
    const filteredResult = rawPeople.filter(
      person => person.name.toLowerCase().includes(keyword) || person.institution.toLowerCase().includes(keyword)
    );

    setPeople(keyword.length ? filteredResult : rawPeople);
  };

  const tempPeople = () => people.slice(0, peoples);

  return (
    <Card>
      <FalconCardHeader title={`Followers (${tempPeople().length})`}>
        {isIterableArray(peopleCategories) && (
          <Form inline>
            <Input bsSize="sm" placeholder="Search..." onChange={searchPeople} />
            <CustomInput
              type="select"
              id="exampleCustomSelect"
              name="customSelect"
              bsSize="sm"
              className="d-md-block d-none ml-2"
            >
              {peopleCategories.map((option, index) => (
                <option value={index} key={index}>
                  {option}
                </option>
              ))}
            </CustomInput>
          </Form>
        )}
      </FalconCardHeader>
      <CardBody className="bg-light p-0">
        {loading ? (
          <Loader />
        ) : isIterableArray(people) ? (
          <Row noGutters className="text-center fs--1">
            {tempPeople().map((follower, index) => (
              <Col className={className} key={index}>
                <Member {...follower} />
              </Col>
            ))}
          </Row>
        ) : (
          <Row className="p-card">
            <Col>
              <Alert color="info" className="mb-0">
                No Followers!
              </Alert>
            </Col>
          </Row>
        )}
      </CardBody>
    </Card>
  );
};

People.propTypes = {
  peoples: PropTypes.number,
  className: PropTypes.string
};

People.defaultProps = {
  className: 'col-6 col-md-4 col-lg-3 col-xxl-2'
};

export default People;
