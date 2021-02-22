import React, { Fragment } from 'react';
import ContentWithAsideLayout from '../../layouts/ContentWithAsideLayout';
import Education from '../education/Education';
import Experience from '../experience/Experience';
import SettingsAccount from '../Settings/SettingsAccount';
import SettingsBilling from '../Settings/SettingsBilling';
import SettingsChangePassword from '../Settings/SettingsChangePassword';
import SettingsDangerZone from '../Settings/SettingsDangerZone';
import SettingsProfile from '../Settings/SettingsProfile';
import ItemBanner from '../item/ItemBanner';

import experiences from '../../data/experience/experiences';
import educations from '../../data/education/educations';

import team2 from '../../assets/img/team/2.jpg';
import generic4 from '../../assets/img/generic/4.jpg';

const SettingsAside = () => (
  <Fragment>
    <SettingsAccount />
    <SettingsBilling />
    <SettingsChangePassword />
    <SettingsDangerZone />
  </Fragment>
);

const SettingsBanner = () => (
  <ItemBanner>
    <ItemBanner.Header avatarSrc={team2} coverSrc={generic4} isEditable />
  </ItemBanner>
);

const SettingsContent = () => (
  <Fragment>
    <SettingsProfile />
    <Experience experiences={experiences} isEditable className="mb-3" />
    <Education educations={educations} isEditable className="mb-3 mb-lg-0" />
  </Fragment>
);

const Settings = () => {
  return (
    <ContentWithAsideLayout banner={<SettingsBanner />} aside={<SettingsAside />}>
      <SettingsContent />
    </ContentWithAsideLayout>
  );
};

export default Settings;
