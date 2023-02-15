import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardFooter, Col, CustomInput, Row } from 'reactstrap';
import CardDropdown from './CardDropdown';
import FalconCardHeader from '../common/FalconCardHeader';
import Flex from '../common/Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { Circle } from 'react-es6-progressbar.js';
import { rgbaColor, themeColors } from '../../helpers/utils';

const BandwidthSaved = ({ total, saved }) => {
  const options = {
    color: themeColors.primary,
    progress: saved / total,
    strokeWidth: 5,
    trailWidth: 5,
    trailColor: rgbaColor('#000', 0.15),
    easing: 'easeInOut',
    duration: 3000,
    svgStyle: {
      'stroke-linecap': 'round',
      display: 'block',
      width: '100%'
    },
    text: { autoStyleContainer: false },
    // Set default step function for all animate calls
    step: (state, circle) => {
      const percentage = Math.round(circle.value() * 100);
      circle.setText(`<span class='value'>${percentage}<b>%</b></span>`);
    }
  };

  return (
    <Card className="h-100">
      <FalconCardHeader title="Bandwidth Saved" titleTag="h6" className="py-2">
        <CardDropdown />
      </FalconCardHeader>
      <CardBody tag={Flex} align="center" justify="center" className="h-100">
        <div>
          <Circle
            progress={saved / total}
            options={options}
            container_class="progress-circle progress-circle-dashboard"
            container_style={{ width: '150px', height: '150px' }}
          />
          <div className="text-center mt-4">
            <h6 className="fs-0 mb-1">
              <FontAwesomeIcon icon="check" transform="shrink-2" className="text-success mr-1" />
              {saved} GB saved
            </h6>
            <p className="fs--1 mb-0">{total} GB total bandwidth</p>
          </div>
        </div>
      </CardBody>
      <CardFooter className="bg-light py-2">
        <Row className="flex-between-center">
          <Col xs="auto">
            <CustomInput type="select" id="exampleCustomSelect" bsSize="sm">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>Last 2 Year</option>
            </CustomInput>
          </Col>
          <Col xs="auto">
            <Link className="fs--1" to="#!">
              Help
            </Link>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  );
};

BandwidthSaved.propTypes = {
  total: PropTypes.number.isRequired,
  saved: PropTypes.number.isRequired
};

export default BandwidthSaved;
