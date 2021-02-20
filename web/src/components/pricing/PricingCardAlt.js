import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Flex from '../common/Flex';
import { isIterableArray } from '../../helpers/utils';

const PricingRowAlt = ({ isDisable, isLast, children }) => (
  <li className={classNames('py-2', { 'border-bottom': !isLast, 'text-300': isDisable })}>
    <FontAwesomeIcon icon="check" transform="shrink-2" className={classNames({ 'text-primary': !isDisable })} />{' '}
    {children}
  </li>
);

PricingRowAlt.propTypes = {
  isDisable: PropTypes.bool,
  isLast: PropTypes.bool,
  children: PropTypes.node
};

const PricingCardAlt = ({ type, price, image, features, button, isYearly }) => {
  const plan = isYearly ? 'year' : 'month';

  return (
    <div className="border rounded-soft overflow-hidden mb-3 mb-md-0">
      <Flex align="center" justify="between" className="p-4">
        <div>
          <h3 className="font-weight-light fs-5 mb-0 text-primary">{type}</h3>
          <h2 className="font-weight-light mt-0 text-primary">
            <sup className="fs-1">$</sup>
            <span className="fs-3">{price[plan]}</span>
            <span className="fs--2 mt-1">/ {plan}</span>
          </h2>
        </div>
        <div className="pr-3">
          <img src={image} width="70" alt="" />
        </div>
      </Flex>
      <div className="p-4 bg-light">
        <ul className="list-unstyled">
          {isIterableArray(features) &&
            features.map((feature, index) => (
              <PricingRowAlt isDisable={feature.isDisable} key={index} isLast={features.length === index + 1}>
                {feature.title}
              </PricingRowAlt>
            ))}
        </ul>
        <Button color={button.color} block>
          {button.text}
        </Button>
      </div>
    </div>
  );
};

PricingCardAlt.propTypes = {
  type: PropTypes.string.isRequired,
  price: PropTypes.object.isRequired,
  isYearly: PropTypes.bool.isRequired,
  image: PropTypes.string.isRequired,
  features: PropTypes.array.isRequired,
  button: PropTypes.object.isRequired
};

export default PricingCardAlt;
