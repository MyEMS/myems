import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card, CardBody, Col, Row } from 'reactstrap';
import Background from './Background';
import corner4 from '../../assets/img/illustrations/corner-4.png';
import createMarkup from '../../helpers/createMarkup';

const PageHeader = ({ title, titleTag: TitleTag, description, image, col, children, ...rest }) => (
  <Card {...rest}>
    <Background
      image={image}
      className="bg-card"
      style={{ borderTopRightRadius: '0.375rem', borderBottomRightRadius: '0.375rem' }}
    />
    <CardBody>
      <Row>
        <Col {...col}>
          <TitleTag className="mb-0">{title}</TitleTag>
          {description && (
            <p
              className={classNames('mt-2', { 'mb-0': !children })}
              dangerouslySetInnerHTML={createMarkup(description)}
            />
          )}
          {children}
        </Col>
      </Row>
    </CardBody>
  </Card>
);

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  titleTag: PropTypes.string,
  description: PropTypes.string,
  col: PropTypes.shape(Col.propTypes),
  image: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
};

PageHeader.defaultProps = { col: { lg: 8 }, image: corner4, titleTag: 'h3' };

export default PageHeader;
