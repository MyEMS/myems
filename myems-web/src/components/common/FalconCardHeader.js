import React from 'react';
import PropTypes from 'prop-types';
import { Col, CardHeader, Row } from 'reactstrap';
import classNames from 'classnames';

const Title = ({ titleTag: TitleTag, className, breakPoint, children }) => (
  <TitleTag
    className={classNames(
      {
        'mb-0': !breakPoint,
        [`mb-${breakPoint}-0`]: !!breakPoint
      },
      className
    )}
  >
    {children}
  </TitleTag>
);

Title.propsType = {
  breakPoint: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'xxl']),
  titleTag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  className: PropTypes.string,
  children: PropTypes.node
};

Title.defaultProps = { titleTag: 'h5' };

const FalconCardHeader = ({ title, light, titleTag, titleClass, className, breakPoint, children }) => (
  <CardHeader className={classNames({ 'bg-light': light }, className)}>
    {children ? (
      <Row className="align-items-center">
        <Col>
          <Title breakPoint={breakPoint} titleTag={titleTag} className={titleClass}>
            {title}
          </Title>
        </Col>
        <Col
          {...{ [breakPoint ? breakPoint : 'xs']: 'auto' }}
          className={`text${breakPoint ? `-${breakPoint}` : ''}-right`}
        >
          {children}
        </Col>
      </Row>
    ) : (
      <Title breakPoint={breakPoint} titleTag={titleTag} className={titleClass}>
        {title}
      </Title>
    )}
  </CardHeader>
);

FalconCardHeader.propTypes = {
  title: PropTypes.node.isRequired,
  light: PropTypes.bool,
  breakPoint: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'xxl']),
  titleTag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  titleClass: PropTypes.string,
  className: PropTypes.string,
  children: PropTypes.node
};

FalconCardHeader.defaultProps = { light: true };

export default FalconCardHeader;
