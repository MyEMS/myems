import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Row, Col } from 'reactstrap';

const ContentWithAsideLayout = ({ banner, aside, footer, isStickyAside, children }) => {
  return (
    <Fragment>
      {banner}
      <Row noGutters>
        <Col lg="8" className={classNames('pr-lg-2', { 'mb-3': !isStickyAside })}>
          {children}
        </Col>
        <Col lg="4" className={classNames('pl-lg-2', { 'mb-3': !isStickyAside })}>
          {isStickyAside ? <div className="sticky-top sticky-sidebar">{aside}</div> : aside}
        </Col>
      </Row>
      {footer}
    </Fragment>
  );
};

ContentWithAsideLayout.propTypes = {
  aside: PropTypes.element.isRequired,
  banner: PropTypes.element,
  footer: PropTypes.element,
  isStickyAside: PropTypes.bool,
  children: PropTypes.node
};

ContentWithAsideLayout.defaultProps = { isStickyAside: true };

export default ContentWithAsideLayout;
