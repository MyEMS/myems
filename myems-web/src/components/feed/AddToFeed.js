import React from 'react';
import PropTypes from 'prop-types';
import useFakeFetch from '../../hooks/useFakeFetch';
import { Card, CardBody } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import { Link } from 'react-router-dom';
import Loader from '../common/Loader';
import { isIterableArray } from '../../helpers/utils';
import PersonFollow from './PersonFollow';
import rawPeople from '../../data/people/people';

const AddToFeed = ({ peoples }) => {
  const { loading: peopleLoading, data: people } = useFakeFetch(rawPeople.slice(0, peoples));

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Add to your feed" titleTag="h5">
        <Link className="fs--1" to="/pages/people">
          See all
        </Link>
      </FalconCardHeader>
      <CardBody>
        {peopleLoading ? (
          <Loader />
        ) : (
          isIterableArray(people) &&
          people.map((person, index) => (
            <PersonFollow {...person} key={person.id} divider={people.length === index + 1} />
          ))
        )}
      </CardBody>
    </Card>
  );
};

AddToFeed.propTypes = {
  peoples: PropTypes.number
};

export default AddToFeed;
