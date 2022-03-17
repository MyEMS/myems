import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const StarCount = ({ stars, base = [1, 2, 3, 4, 5] }) => {
  return (
    <Fragment>
      {base.map(index => (
        <Fragment key={index}>
          {index <= stars && <FontAwesomeIcon icon="star" className="text-warning" />}
          {stars.toString().split('.')[1] === '5' && stars.toString().split('.')[0] === (index - 1).toString() ? (
            <FontAwesomeIcon icon="star-half-alt" className="text-warning" />
          ) : (
            index > stars && <FontAwesomeIcon icon="star" className="text-300" />
          )}
        </Fragment>
      ))}
    </Fragment>
  );
};

StarCount.propTypes = { stars: PropTypes.number.isRequired };

export default StarCount;
