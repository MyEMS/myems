import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { Badge, Button } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isIterableArray } from '../../helpers/utils';

const PricingRow = ({ children }) => (
  <li className="py-1">
    <FontAwesomeIcon icon="check" transform="shrink-2" className="text-success" /> {children}
  </li>
);

PricingRow.propTypes = { children: PropTypes.node };

const PricingCard = ({
  type,
  description,
  price,
  featureTitle,
  features,
  button,
  bottomButtonText,
  isYearly,
  backgroundColor
}) => {
  const plan = isYearly ? 'year' : 'month';

  return (
    <div className="h-100" style={{ backgroundColor }}>
      <div className="text-center p-4">
        <h3 className="font-weight-normal my-0">{type}</h3>
        <p className="mt-3">{description}</p>
        <h2 className="font-weight-medium my-4">
          <sup className="font-weight-normal fs-2 mr-1">$</sup>
          {price[plan]}
          <small className="fs--1 text-700">/ {plan}</small>
        </h2>
        <Button tag={Link} color={button.color} to="/pages/billing">
          {button.text}
        </Button>
      </div>
      <hr className="border-bottom-0 m-0" />
      <div className={classNames('text-left px-sm-4 py-4', { 'px-3': backgroundColor })}>
        <h5 className="font-weight-medium fs-0">{featureTitle}</h5>
        <ul className="list-unstyled mt-3">
          {isIterableArray(features) &&
            features.map((feature, index) => (
              <PricingRow key={index}>
                {feature.title}{' '}
                {feature.badge && (
                  <Badge color={feature.badge.color} pill className="ml-1">
                    {feature.badge.text}
                  </Badge>
                )}
              </PricingRow>
            ))}
        </ul>
        <Button tag={Link} color="link" to="#!">
          {bottomButtonText}
        </Button>
      </div>
    </div>
  );
};

PricingCard.propTypes = {
  type: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  price: PropTypes.object.isRequired,
  featureTitle: PropTypes.string.isRequired,
  features: PropTypes.array.isRequired,
  button: PropTypes.object.isRequired,
  bottomButtonText: PropTypes.string.isRequired,
  isYearly: PropTypes.bool.isRequired,
  backgroundColor: PropTypes.string
};

export default PricingCard;
