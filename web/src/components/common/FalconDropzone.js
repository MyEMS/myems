import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Dropzone from 'react-dropzone';
import uuid from 'uuid/v1';
import classNames from 'classnames';
import { isIterableArray } from '../../helpers/utils';
import { DropdownItem, DropdownMenu, DropdownToggle, Media, UncontrolledDropdown } from 'reactstrap';
import Flex from './Flex';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import cloudUpload from '../../assets/img/icons/cloud-upload.svg';

const getSize = size => {
  if (size < 1024) {
    return (
      <Fragment>
        <strong>{size}</strong> Byte
      </Fragment>
    );
  } else if (size < 1024 * 1024) {
    return (
      <Fragment>
        <strong>{(size / 1024).toFixed(2)}</strong> KB
      </Fragment>
    );
  } else {
    return (
      <Fragment>
        <strong>{(size / (1024 * 1024)).toFixed(2)}</strong> MB
      </Fragment>
    );
  }
};

const FalconDropzone = ({ placeholder, className, onChange, files, preview, ...rest }) => (
  <Fragment>
    <Dropzone
      onDrop={acceptedFiles => {
        const stringFiles = [];
        if (!!acceptedFiles.length) {
          acceptedFiles.map(file => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              stringFiles.push({
                id: uuid(),
                base64: reader.result,
                size: file.size,
                path: file.path,
                type: file.type
              });
              onChange([...stringFiles]);
            };
            return true;
          });
        }
      }}
    >
      {({ getRootProps, getInputProps }) => (
        <div
          {...getRootProps({
            className: classNames(
              'p-3 border-dashed border-2x border-300 bg-light rounded-soft text-center cursor-pointer',
              className
            )
          })}
        >
          <input {...{ ...getInputProps(), ...rest }} />
          {placeholder}
        </div>
      )}
    </Dropzone>
    {preview && isIterableArray(files) && (
      <div className="border-top mt-3">
        {files.map(({ id, path, base64, size }) => (
          <Media className="align-items-center py-3 border-bottom btn-reveal-trigger" key={id}>
            <img className="img-fluid" width={38} src={base64} alt={path} />
            <Media body tag={Flex} justify="between" align="center" className="ml-3">
              <div>
                <h6 data-dz-name="">{path}</h6>
                <Flex className="position-relative" align="center">
                  <p className="mb-0 fs--1 text-400 line-height-1">{getSize(size)}</p>
                </Flex>
              </div>
              <UncontrolledDropdown className="text-sans-serif">
                <DropdownToggle color="link" size="sm" className="text-600 btn-reveal">
                  <FontAwesomeIcon icon="ellipsis-h" />
                </DropdownToggle>
                <DropdownMenu className="border py-0" right>
                  <div className="bg-white py-2">
                    <DropdownItem
                      className="text-danger"
                      onClick={() => onChange(files.filter(file => file.id !== id))}
                    >
                      Remove File
                    </DropdownItem>
                  </div>
                </DropdownMenu>
              </UncontrolledDropdown>
            </Media>
          </Media>
        ))}
      </div>
    )}
  </Fragment>
);

FalconDropzone.propTypes = {
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  className: PropTypes.string,
  files: PropTypes.array,
  preview: PropTypes.bool,
  isMulti: PropTypes.bool
};

FalconDropzone.defaultProps = {
  placeholder: <img src={cloudUpload} alt="" width={25} className="mr-2" />,
  files: [],
  preview: false
};

export default FalconDropzone;
