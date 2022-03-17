import React from 'react';
import { Button } from 'reactstrap';
import ItemBanner from '../item/ItemBanner';
import g from '../../assets/img/logos/g.png';
import hp from '../../assets/img/logos/hp.png';
import team2 from '../../assets/img/team/2.jpg';
import generic4 from '../../assets/img/generic/4.jpg';
import apple from '../../assets/img/logos/apple.png';

const ProfileBanner = () => (
  <ItemBanner>
    <ItemBanner.Header avatarSrc={team2} coverSrc={generic4} />
    <ItemBanner.Body
      name="Anthony Hopkins"
      verified
      headline="Senior Software Engineer at Technext Limited"
      location="New York, USA"
      noOfFollowers={330}
      previousJobs={[
        { institution: 'Google', src: g },
        { institution: 'Apple', src: apple },
        { institution: 'Hewlett Packard', src: hp }
      ]}
    >
      <Button color="falcon-primary" size="sm" className="px-3">
        Following
      </Button>
      <Button color="falcon-default" size="sm" className="px-3 ml-2">
        Message
      </Button>
    </ItemBanner.Body>
  </ItemBanner>
);

export default ProfileBanner;
