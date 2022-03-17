import React, { useState } from 'react';
import { Button, Card, CardBody, Col, Form, Row } from 'reactstrap';
import FalconCardHeader from '../common/FalconCardHeader';
import FormGroupInput from '../common/FormGroupInput';
import Flex from '../common/Flex';

const SettingsProfile = () => {
  const [firstName, setFirstName] = useState('Anthony');
  const [lastName, setLastName] = useState('Hopkins');
  const [email, setEmail] = useState('anthony@gmail.com');
  const [phone, setPhone] = useState('+44098098304');
  const [heading, setHeading] = useState('Software Engineer');
  const [intro, setIntro] = useState(
    'Dedicated, passionate, and accomplished Full Stack Developer with 9+ years of progressive experience working as an Independent Contractor for Google and developing and growing my educational social network that helps others learn programming, web design, game development, networking. I’ve acquired a wide depth of knowledge and expertise in using my technical skills in programming, computer science, software development, and mobile app development to developing solutions to help organizations increase productivity, and accelerate business performance. It’s great that we live in an age where we can share so much with technology but I’m but I’m ready for the next phase of my career, with a healthy balance between the virtual world and a workplace where I help others face-to-face. There’s always something new to learn, especially in IT-related fields. People like working with me because I can explain technology to everyone, from staff to executives who need me to tie together the details and the big picture. I can also implement the technologies that successful projects need.'
  );

  const handleProfileSettings = e => {
    e.preventDefault();
    console.log({ firstName, lastName, email, phone, heading, intro });
  };

  return (
    <Card className="mb-3">
      <FalconCardHeader title="Profile Settings" light={false} />
      <CardBody className="bg-light">
        <Form onSubmit={handleProfileSettings}>
          <Row>
            <Col lg={6}>
              <FormGroupInput
                id="first-name"
                label="First Name"
                value={firstName}
                onChange={({ target }) => setFirstName(target.value)}
              />
            </Col>
            <Col lg={6}>
              <FormGroupInput
                id="last-name"
                label="First Name"
                value={lastName}
                onChange={({ target }) => setLastName(target.value)}
              />
            </Col>
            <Col lg={6}>
              <FormGroupInput
                id="email"
                label="Email"
                value={email}
                onChange={({ target }) => setEmail(target.value)}
                type="email"
              />
            </Col>
            <Col lg={6}>
              <FormGroupInput
                id="phone"
                label="Phone"
                value={phone}
                onChange={({ target }) => setPhone(target.value)}
                type="tel"
              />
            </Col>
            <Col xs={12}>
              <FormGroupInput
                id="heading"
                label="Heading"
                value={heading}
                onChange={({ target }) => setHeading(target.value)}
              />
            </Col>
            <Col xs={12}>
              <FormGroupInput
                id="intro"
                label="Intro"
                value={intro}
                onChange={({ target }) => setIntro(target.value)}
                type="textarea"
                rows="13"
              />
            </Col>
            <Col tag={Flex} xs={12} justify="end">
              <Button color="primary" type="submit" onClick={handleProfileSettings}>
                Update
              </Button>
            </Col>
          </Row>
        </Form>
      </CardBody>
    </Card>
  );
};

export default SettingsProfile;
