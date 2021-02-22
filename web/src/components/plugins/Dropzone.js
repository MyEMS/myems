import React, { Fragment } from 'react';
import PageHeader from '../common/PageHeader';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconEditor from '../common/FalconEditor';
import FalconCardHeader from '../common/FalconCardHeader';

import FalconDropzone from '../common/FalconDropzone';
import avatarImg from '../../assets/img/team/avatar.png';
import { isIterableArray } from '../../helpers/utils';
import Avatar from '../common/Avatar';

import cloudUpload from '../../assets/img/icons/cloud-upload.svg';

const dropzoneCode = `function DropzoneExample() {
  const [avatar, setAvatar] = useState([{ src: avatarImg }]);

  return <Media className="flex-center pb-3 d-block d-md-flex text-center mb-2">
  <Avatar
    size="4xl"
    className="mb-2"
    src={isIterableArray(avatar) ? avatar[0].base64 || avatar[0].src : ''}
  />
  <Media body className="ml-md-4">
    <FalconDropzone
      files={avatar}
      onChange={files => {
        setAvatar(files);
      }}
      multiple={false}
      accept="image/*"
      placeholder={
        <Fragment>
          <Media className=" fs-0 mx-auto d-inline-flex align-items-center">
            <img src={cloudUpload} alt="" width={25} className="mr-2" />
            <Media>
              <p className="fs-0 mb-0 text-700">Upload your profile picture</p>
            </Media>
          </Media>
          <p className="mb-0 w-75 mx-auto text-500">
            Upload a 300x300 jpg image with a maximum size of 400KB
          </p>
        </Fragment>
      }
    />
  </Media>
</Media>
}`;

const Dropzone = () => {
  return (
    <Fragment>
      <PageHeader
        title="Dropzone"
        description="Simple React hook to create a HTML5-compliant drag'n'drop zone for files."
        className="mb-3"
      >
        <Button tag="a" href="https://react-dropzone.js.org/" target="_blank" color="link" size="sm" className="pl-0">
          React-dropzone Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card>
        <FalconCardHeader title="Image Drop example" />

        <CardBody>
          <FalconEditor
            code={dropzoneCode}
            scope={{ FalconDropzone, Avatar, isIterableArray, cloudUpload, avatarImg }}
            language="jsx"
          />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Dropzone;
