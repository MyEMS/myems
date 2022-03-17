import React from 'react';
import ContentWithAsideLayout from '../../layouts/ContentWithAsideLayout';
import ProfileBanner from './ProfileBanner';
import ProfileAside from './ProfileAside';
import ProfileContent from './ProfileContent';
import ProfileFooter from './ProfileFooter';

const Profile = () => {
  return (
    <ContentWithAsideLayout banner={<ProfileBanner />} aside={<ProfileAside />} footer={<ProfileFooter />}>
      <ProfileContent />
    </ContentWithAsideLayout>
  );
};

export default Profile;
