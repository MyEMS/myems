import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Col } from 'reactstrap';
import HighlightMedia from '../common/HighlightMedia';

const ProfileBannerHighlights = ({ noOfFollowers, previousJobs }) => {
  return (
    <Col className="pl-2 pl-lg-3">
      {noOfFollowers > 0 && (
        <HighlightMedia icon="user-circle">
          <h6 className="mb-0">See followers ({noOfFollowers})</h6>
        </HighlightMedia>
      )}
      {previousJobs.length > 0 && (
        <Fragment>
          {previousJobs.map(({ institution, src }, index) => (
            <HighlightMedia src={src} key={index}>
              <h6 className="mb-0">{institution}</h6>
            </HighlightMedia>
          ))}
        </Fragment>
      )}
    </Col>
  );
};

ProfileBannerHighlights.propTypes = {
  noOfFollowers: PropTypes.number,
  previousJobs: PropTypes.arrayOf(
    PropTypes.shape({
      institution: PropTypes.string,
      src: PropTypes.string
    })
  )
};

ProfileBannerHighlights.defaultProps = {
  noOfFollowers: 0,
  previousJobs: []
};

export default ProfileBannerHighlights;
