import React from 'react';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';
import { Card, CardBody } from 'reactstrap';
import Background from '../../common/Background';
import corner1 from '../../../assets/img/illustrations/corner-1.png';
import corner2 from '../../../assets/img/illustrations/corner-2.png';
import corner3 from '../../../assets/img/illustrations/corner-3.png';
import corner5 from '../../../assets/img/illustrations/corner-5.png';
import corner6 from '../../../assets/img/illustrations/corner-6.png';
import corner7 from '../../../assets/img/illustrations/corner-7.png';
import corner8 from '../../../assets/img/illustrations/corner-8.png';
import corner9 from '../../../assets/img/illustrations/corner-9.png';
import corner10 from '../../../assets/img/illustrations/corner-10.png';
import corner11 from '../../../assets/img/illustrations/corner-11.png';
import corner12 from '../../../assets/img/illustrations/corner-12.png';
import corner13 from '../../../assets/img/illustrations/corner-13.png';
import corner14 from '../../../assets/img/illustrations/corner-14.png';
import corner15 from '../../../assets/img/illustrations/corner-15.png';
import corner16 from '../../../assets/img/illustrations/corner-16.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const getImage = color => {
  switch (color) {
    case 'warning':
      return corner1;
    case 'info':
      return corner2;
    case 'success':
      return corner3;
    case 'electricity':
      return corner5;
    case 'fuelConsumption':
    case 'water':
      return corner6;
    case 'gas':
      return corner7;
    case 'charge':
      return corner8;
    case 'co2':
      return corner9;
    case 'discharge':
      return corner10;
    case 'cost':
      return corner11;
    case 'income':
      return corner12;
    case 'alarm':
      return corner13;
    case 'powerStation':
      return corner14;
    case 'ratedCapacity':
      return corner15;
    case 'ratedPower':
      return corner16;
    default:
      return corner1;
  }
};

const getIcon = rate => {
  if (rate == null) return null;
  let r = parseFloat(rate.substring(0, rate.length - 1));
  if (r > 0.0) return <FontAwesomeIcon icon="arrow-up" />;
  else if (r < 0.0) return <FontAwesomeIcon icon="arrow-down" />;
  else return null;
};

const getContentClassNames = color => {
  const contentClassNames = 'display-4 fs-4 mb-2 font-weight-normal text-sans-serif';
  if (color === 'success') return contentClassNames;
  return `${contentClassNames} text-${color}`;
};

const CardSummary = ({ title, rate, color, children, footnote, footvalue, footunit,
   secondfootnote, secondfootvalue, secondfootunit }) => {
  return (
    <Card className="mb-3 overflow-hidden" style={{ minWidth: '12rem' }}>
      <Background image={getImage(color)} className="bg-card" />
      <CardBody className="position-relative">
        <h6>
          {title}
          <span className={`badge badge-soft-${color} rounded-capsule ml-2`}>
            {getIcon(rate)}
            {rate}
          </span>
        </h6>
        <div className={getContentClassNames(color)}>{children}</div>
        <h6 className="font-weight-semi-bold fs--1 text-nowrap">
          {footnote}{' '}
          {footvalue && <CountUp end={footvalue} duration={2} prefix="" separator="," decimal="." decimals={2} />}{' '}
          {footunit}
        </h6>
        <h6 className="font-weight-semi-bold fs--1 text-nowrap">
          {secondfootnote}{' '}
          {secondfootvalue && <CountUp end={secondfootvalue} duration={2} prefix="" separator="," decimal="." decimals={2} />}{' '}
          {secondfootunit}
        </h6>
      </CardBody>
    </Card>
  );
};

CardSummary.propTypes = {
  title: PropTypes.string.isRequired,
  rate: PropTypes.string.isRequired,
  color: PropTypes.string,
  children: PropTypes.node,
  footnote: PropTypes.string,
  footvalue: PropTypes.number,
  footunit: PropTypes.string,
  secondfootnote: PropTypes.string,
  secondfootvalue: PropTypes.number,
  secondfootunit: PropTypes.string
};

CardSummary.defaultProps = {
  color: 'primary'
};

export default CardSummary;
