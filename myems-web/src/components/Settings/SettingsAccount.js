import React, { useState } from 'react';
import { Card, CardBody, CustomInput, UncontrolledTooltip } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../common/FalconCardHeader';

const SettingsAccount = () => {
  // State
  const [viewProfile, setViewProfile] = useState('view-everyone');
  const [tagSetting, setTagSetting] = useState('tag-off');
  const [showFollowers, setShowFollowers] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showExperiences, setShowExperiences] = useState(false);
  const [showPhoneNumber, setShowPhoneNumber] = useState(true);
  const [allowFollow, setAllowFollow] = useState(false);

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Account Settings" light={false} />
      <CardBody className="bg-light">
        <h6 className="font-weight-bold">
          Who can see your profile ?
          <FontAwesomeIcon icon="question-circle" className="fs--2 ml-1 text-primary" id="view-setting-tooltip" />
          <UncontrolledTooltip placement="top" target="view-setting-tooltip">
            Only the group of selected people can see your profile
          </UncontrolledTooltip>
        </h6>
        <div className="pl-2">
          <CustomInput
            name="view-setting"
            id="view-everyone"
            label="Everyone"
            value="view-everyone"
            onChange={({ target }) => setViewProfile(target.value)}
            checked={viewProfile === 'view-everyone'}
            type="radio"
          />
          <CustomInput
            name="view-setting"
            id="view-my-followers"
            label="My Followers"
            value="view-my-followers"
            onChange={({ target }) => setViewProfile(target.value)}
            checked={viewProfile === 'view-my-followers'}
            type="radio"
          />
          <CustomInput
            name="view-setting"
            id="view-only-me"
            label="Only Me"
            value="view-only-me"
            onChange={({ target }) => setViewProfile(target.value)}
            checked={viewProfile === 'view-only-me'}
            type="radio"
          />
        </div>
        <h6 className="mt-2 font-weight-bold">
          Who can tag you ?
          <FontAwesomeIcon icon="question-circle" className="fs--2 ml-1 text-primary" id="tag-setting-tooltip" />
          <UncontrolledTooltip placement="top" target="tag-setting-tooltip">
            Only the group of selected people can tag you
          </UncontrolledTooltip>
        </h6>
        <div className="pl-2">
          <CustomInput
            name="tag-setting"
            id="tag-everyone"
            label="Everyone"
            value="everyone"
            onChange={({ target }) => setTagSetting(target.value)}
            checked={tagSetting === 'everyone'}
            type="radio"
          />
          <CustomInput
            name="tag-setting"
            id="tag-group-members"
            label="Group Members"
            value="tag-group-members"
            onChange={({ target }) => setTagSetting(target.value)}
            checked={tagSetting === 'tag-group-members'}
            type="radio"
          />
          <CustomInput
            name="tag-setting"
            id="tag-off"
            label="Off"
            value="tag-off"
            onChange={({ target }) => setTagSetting(target.value)}
            checked={tagSetting === 'tag-off'}
            type="radio"
          />
        </div>
        <hr className="border-dashed border-bottom-0" />
        <CustomInput
          id="show-followers"
          label="Allow users to show your followers"
          onChange={() => setShowFollowers(!showFollowers)}
          checked={showFollowers}
          type="checkbox"
        />
        <CustomInput
          id="show-email"
          label="Allow users to show your email"
          onChange={() => setShowEmail(!showEmail)}
          checked={showEmail}
          type="checkbox"
        />
        <CustomInput
          id="show-experiences"
          label="Allow users to show your experiences"
          onChange={() => setShowExperiences(!showExperiences)}
          checked={showExperiences}
          type="checkbox"
        />
        <hr className="border-dashed border-bottom-0" />
        <CustomInput
          id="show-phone-number"
          label="Make your phone number visible"
          onChange={() => setShowPhoneNumber(!showPhoneNumber)}
          checked={showPhoneNumber}
          type="switch"
        />
        <CustomInput
          id="allow-follow"
          label="Allow user to follow you"
          onChange={() => setAllowFollow(!allowFollow)}
          checked={allowFollow}
          type="switch"
        />
      </CardBody>
    </Card>
  );
};

export default SettingsAccount;
