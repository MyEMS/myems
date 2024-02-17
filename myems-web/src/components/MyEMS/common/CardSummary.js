import React from 'react';
import PropTypes from 'prop-types';
import CountUp from 'react-countup';
import { Card, CardBody } from 'reactstrap';
import Background from '../../common/Background';
import corner1 from '../../../assets/img/illustrations/corner-1.png';
import corner2 from '../../../assets/img/illustrations/corner-2.png';
import corner3 from '../../../assets/img/illustrations/corner-3.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const getImage = color => {
  switch (color) {
    case 'warning':
      return corner1;
    case 'info':
      return corner2;
    case 'success':
      return corner3;
    default:
      return corner1;
  }
};

const getIcon = rate => {
  if (rate == null) return null;
  let r = parseFloat(rate.substring(0,rate.length-1))
  if (r > 0.0)
    return <FontAwesomeIcon icon="arrow-up"/>;
  else if (r < 0.0)
    return <FontAwesomeIcon icon="arrow-down"/>;
  else
    return null;
};

const getContentClassNames = color => {
  const contentClassNames = 'display-4 fs-4 mb-2 font-weight-normal text-sans-serif';
  if (color === 'success') return contentClassNames;
  return `${contentClassNames} text-${color}`;
};

const CardSummary = ({ title, rate, color, children, footnote, footvalue, footunit }) => {
  return (
    <Card className="mb-3 overflow-hidden" style={{ minWidth: '12rem' }}>
      <Background image={getImage(color)} className="bg-card" />
      <CardBody className="position-relative">
        <h6>
          {title}
          <span className={`badge badge-soft-${color} rounded-capsule ml-2`}>{getIcon(rate)}{rate}</span>
        </h6>
        <div className={getContentClassNames(color)}>{children}</div>
        <h6 className="font-weight-semi-bold fs--1 text-nowrap">
          {footnote} {footvalue && <CountUp end={footvalue} duration={2} prefix="" separator="," decimal="." decimals={2} />} {footunit}
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
};

CardSummary.defaultProps = {
  color: 'primary'
};

export default CardSummary;
