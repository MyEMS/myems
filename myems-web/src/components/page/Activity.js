import React from 'react';
import { Alert, Card, CardBody, Col, Row } from 'reactstrap';
import Loader from '../common/Loader';
import FalconCardHeader from '../common/FalconCardHeader';
import Notification from '../notification/Notification';
import { isIterableArray } from '../../helpers/utils';
import useFakeFetch from '../../hooks/useFakeFetch';
import rawActivities from '../../data/activity/activities';

const Activity = () => {
  const { loading, data: activities } = useFakeFetch(rawActivities);

  return (
    <Card>
      <FalconCardHeader title="Activity log" />
      <CardBody className="fs--1 p-0">
        {loading ? (
          <Loader />
        ) : isIterableArray(activities) ? (
          activities.map((activity, index) => {
            const roundedClass = activities.length === index + 1 ? 'rounded-top-0' : 'rounded-0';

            return (
              <Notification
                key={index}
                className={`border-x-0 border-bottom-0 border-300 ${roundedClass}`}
                {...activity}
              />
            );
          })
        ) : (
          <Row className="p-card">
            <Col>
              <Alert color="info" className="mb-0">
                No activity found
              </Alert>
            </Col>
          </Row>
        )}
      </CardBody>
    </Card>
  );
};

export default Activity;
