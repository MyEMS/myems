import React from 'react';
import { Alert, Card, CardBody, Col, Row } from 'reactstrap';
import Loader from '../common/Loader';
import FalconCardHeader from '../common/FalconCardHeader';
import Association from '../association/Association';
import { isIterableArray } from '../../helpers/utils';
import rawAssociations from '../../data/association/associations';
import useFakeFetch from '../../hooks/useFakeFetch';

const Associations = () => {
  const { loading, data: associations } = useFakeFetch(rawAssociations);

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Associations" />
      <CardBody className="fs--1">
        {loading ? (
          <Loader />
        ) : isIterableArray(associations) ? (
          <Row>
            {associations.map((association, index) => (
              <Col sm={6} md={4} className="mb-3" key={index}>
                <Association {...association} />
              </Col>
            ))}
          </Row>
        ) : (
          <Alert color="info" className="mb-0">
            No association found
          </Alert>
        )}
      </CardBody>
    </Card>
  );
};

export default Associations;
