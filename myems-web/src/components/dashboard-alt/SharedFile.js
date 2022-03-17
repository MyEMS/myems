import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Media } from 'reactstrap';
import classNames from 'classnames';

import cloudDownload from '../../assets/img/icons/cloud-download.svg';
import editAlt from '../../assets/img/icons/edit-alt.svg';

const SharedFile = ({ file, isLast }) => {
  const { img, name, user, time, border } = file;
  return (
    <Fragment>
      <Media className="mb-3 hover-actions-trigger align-items-center">
        <div className="file-thumbnail">
          <img className={classNames('h-100 w-100 fit-cover rounded-soft', { border })} src={img} alt="" />
        </div>
        <Media body className="ml-3">
          <h6 className="mb-1">
            <Link className="stretched-link text-900 font-weight-semi-bold" to="#!">
              {name}
            </Link>
          </h6>
          <div className="fs--1">
            <span className="font-weight-semi-bold">{user}</span>
            <span className="font-weight-medium text-600 ml-2">{time}</span>
          </div>
          <div className="hover-actions r-0 absolute-vertical-center">
            <Button color="light" size="sm" className="border-300 mr-1 text-600 bg-white" tag={'a'} href={img} download>
              <img src={cloudDownload} alt="Download" width={15} />
            </Button>
            <Button color="light" size="sm" className="border-300 text-600 bg-white">
              <img src={editAlt} alt="Edit" width={15} />
            </Button>
          </div>
        </Media>
      </Media>
      {!isLast && <hr className="border-200" />}
    </Fragment>
  );
};

SharedFile.propsType = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  img: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  user: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  border: PropTypes.bool
};

SharedFile.defaultProps = { border: true };

export default SharedFile;
