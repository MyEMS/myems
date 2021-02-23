import React, { Fragment, useState, useContext } from 'react';

import WizardInput from './WizardInput';
import { CustomInput, Media } from 'reactstrap';
import FalconDropzone from '../../common/FalconDropzone';
import avatarImg from '../../../assets/img/team/avatar.png';
import { isIterableArray } from '../../../helpers/utils';
import Avatar from '../../common/Avatar';

import cloudUpload from '../../../assets/img/icons/cloud-upload.svg';
import { AuthWizardContext } from '../../../context/Context';

const AdvanceUserForm = ({ register, errors }) => {
  const { user } = useContext(AuthWizardContext);
  const [avatar, setAvatar] = useState([...(user.avater ? user.avater : []), { src: avatarImg }]);
  const { handleInputChange } = useContext(AuthWizardContext);

  return (
    <Fragment>
      <Media className="flex-center pb-3 d-block d-md-flex text-center mb-2">
        <Avatar size="4xl" className="mb-2" src={isIterableArray(avatar) ? avatar[0]?.base64 || avatar[0]?.src : ''} />
        <Media body className="ml-md-4">
          <FalconDropzone
            files={avatar}
            onChange={files => {
              setAvatar(files);
              handleInputChange({ name: 'avater', value: files });
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
      <WizardInput
        type="select"
        label="Gender"
        placeholder="Select your gender"
        tag={CustomInput}
        name="selectGender"
        id="selectGender"
        onChange={({ target }) => {
          handleInputChange(target);
        }}
        innerRef={register({
          required: false
        })}
        errors={errors}
        options={['Male', 'Female', 'Other']}
      />
      <WizardInput
        type="number"
        label="Phone"
        placeholder="Phone"
        name="phoneNumber"
        onChange={({ target }) => {
          handleInputChange(target);
        }}
        id="name"
        className="input-spin-none"
        innerRef={register({
          required: false
        })}
        errors={errors}
      />
      <WizardInput
        label="Date of Birth"
        id="date"
        customType="datetime"
        name="birthDate"
        placeholder="DD/MM/YYYY"
        errors={errors}
      />

      <WizardInput
        type="textarea"
        label="Address"
        name="address"
        rows="4"
        id="address"
        innerRef={register({
          required: false
        })}
        errors={errors}
      />
    </Fragment>
  );
};

export default AdvanceUserForm;
