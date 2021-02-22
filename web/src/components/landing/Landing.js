import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import NavbarStandard from '../navbar/NavbarStandard';
import Banner from './Banner';
import Partners from './Partners';
import Processes from './Processes';
import Services from './Services';
import Testimonial from './Testimonial';
import Cta from './Cta';
import FooterStandard from './FooterStandard';

const Landing = ({ location, match }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return (
    <Fragment>
      <NavbarStandard location={location} match={match} />
      <Banner />
      <Partners />
      <Processes />
      <Services />
      <Testimonial />
      <Cta />
      <FooterStandard />
    </Fragment>
  );
};

Landing.propTypes = { location: PropTypes.object.isRequired };

export default Landing;
