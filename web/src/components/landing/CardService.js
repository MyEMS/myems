import React from 'react';
import PropTypes from 'prop-types';
import className from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardBody } from 'reactstrap';

const CardService = ({ media, title, description, children }) => (
  <Card className="card-span h-100">
    <div className="card-span-img">
      <FontAwesomeIcon
        icon={media.icon}
        className={className({ [`text-${media.color}`]: media.color }, media.className)}
      />
    </div>
    <CardBody className="pt-6 pb-4">
      <h5 className="mb-2">{title}</h5>
      {description && <p>{description}</p>}
      {children}
    </CardBody>
  </Card>
);

CardService.propTypes = {
  media: PropTypes.shape({
    icon: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
    color: PropTypes.string.isRequired,
    className: PropTypes.string
  }),
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node
};

export default CardService;
