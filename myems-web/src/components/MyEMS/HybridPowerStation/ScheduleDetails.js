import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import {
  Card,
  CardBody,
  Table,
} from 'reactstrap';

import SectionLineChart from '../common/SectionLineChart';

const ScheduleDetails = ({
  xaxisData,
  seriesName,
  seriesData,
  markAreaData,
  t
}) => {

  return (
    <Card className="mb-3 fs--1">
      <CardBody className="bg-light">
        <SectionLineChart
          xaxisData={xaxisData}
          seriesName={seriesName}
          seriesData={seriesData}
          markAreaData={markAreaData}
        />
      </CardBody>
    </Card>
  );
};

ScheduleDetails.propTypes = {
  xaxisData: PropTypes.array.isRequired,
  seriesName: PropTypes.array.isRequired,
  seriesData: PropTypes.array.isRequired,
  markAreaData: PropTypes.array.isRequired,
};

export default withTranslation()(ScheduleDetails);
