import React, { Fragment, useState } from 'react';
import { Media, Card, CardBody } from 'reactstrap';
import Avatar from '../common/Avatar';
import FalconDropzone from '../common/FalconDropzone';
import avatarImg from '../../assets/img/team/avatar.png';
import { isIterableArray } from '../../helpers/utils';
import cloudUpload from '../../assets/img/icons/cloud-upload.svg';

const DropZoneWidget = () => {
  const [avatar, setAvatar] = useState([{ src: avatarImg }]);

  return (
    <Card className="mt-3">
      <CardBody>
        <Media className="flex-center pb-3 d-block d-md-flex text-center mb-2">
          <Avatar size="4xl" className="mb-2" src={isIterableArray(avatar) ? avatar[0].base64 || avatar[0].src : ''} />
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
                  <p className="mb-0 w-75 mx-auto text-500">Upload a 300x300 jpg image with a maximum size of 400KB</p>
                </Fragment>
              }
            />
          </Media>
        </Media>
      </CardBody>
    </Card>
  );
};

export default DropZoneWidget;
