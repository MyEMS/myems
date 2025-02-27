import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { v4 as uuid } from 'uuid';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

const CMDetails = ({
  id,
  name,
  points,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <Table striped className="border-bottom">
          <thead>
            <tr>
              <th>{name}</th>
            </tr>
          </thead>
          <tbody>
              {points.map((currentPoint) => (
                <tr key={uuid()}>
                  <td>{currentPoint[0]}</td>
                  <td>{currentPoint[3]}</td>
                  <td>{currentPoint[1]}</td>
                  <td>{currentPoint[2]}</td>
                </tr>
              ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

CMDetails.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  points: PropTypes.array,
};

export default withTranslation()(CMDetails);
