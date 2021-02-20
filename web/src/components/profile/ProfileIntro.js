import React, { useState } from 'react';
import { Button, Card, CardBody, CardFooter, Collapse } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ProfileIntro = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Intro" />

      <CardBody className="text-justify">
        <p>
          Dedicated, passionate, and accomplished Full Stack Developer with 9+ years of progressive experience working
          as an Independent Contractor for Google and developing and growing my educational social network that helps
          others learn programming, web design, game development, networking.
        </p>
        <Collapse isOpen={!collapsed}>
          <p>
            I've acquired a wide depth of knowledge and expertise in using my technical skills in programming, computer
            science, software development, and mobile app development to developing solutions to help organizations
            increase productivity, and accelerate business performance.
          </p>
          <p>
            It's great that we live in an age where we can share so much with technology but I'm but I'm ready for the
            next phase of my career, with a healthy balance between the virtual world and a workplace where I help
            others face-to-face.
          </p>
          <p>
            There's always something new to learn, especially in IT-related fields. People like working with me because
            I can explain technology to everyone, from staff to executives who need me to tie together the details and
            the big picture. I can also implement the technologies that successful projects need.
          </p>
        </Collapse>
      </CardBody>

      <CardFooter className="bg-light p-0 border-top">
        <Button color="link" block to="/pages/events" onClick={() => setCollapsed(!collapsed)}>
          Show {collapsed ? 'more' : 'less'}
          <FontAwesomeIcon icon="chevron-up" className="ml-1 fs--2" transform={collapsed ? 'rotate-180' : ''} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileIntro;
