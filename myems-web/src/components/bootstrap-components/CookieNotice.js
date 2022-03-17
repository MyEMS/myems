import React, { Fragment, useState } from 'react';
import { Button, Card, CardBody, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import CodeHighlight from '../common/CodeHighlight';

import CookieAlert from './CookieAlert';
import cookieImage from '../../assets/img/icons/cookie.png';

const CookieNotice = () => {
  const [visible, setVisible] = useState(false);
  const onDismiss = () => setVisible(false);

  return (
    <Fragment>
      <PageHeader
        title="Cookie Notice"
        description="Falcon has a built-in notification component that allows users to notify cookie uses on the website."
        className="mb-3"
      >
        <Button
          tag="a"
          href="#!"
          color="link"
          size="sm"
          className="pl-0"
          onClick={() => {
            setVisible(pre => !pre);
          }}
        >
          Toggle notification
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card className="mb-3">
        <FalconCardHeader title="Structure" light={false} />
        <CardBody className="bg-light">
          <p>
            Falcon's Cookie Notice uses Reactstrap's "Alerts" feature to show the notice content. <code>visible</code>{' '}
            state is responsible for showing the notice as a popup. See{' '}
            <a
              href="https://reactstrap.github.io/components/alerts/"
              className="text-decoration-none"
              rel="noopener noreferrer"
            >
              Alerts documentation on Reactstrap
            </a>
          </p>
          <CodeHighlight
            language="html"
            code={`
              <Alert className="notice text-center fs--1 d-flex flex-center" color="light" isOpen={visible} toggle={onDismiss}>
                  // place your content here
              </Alert>`}
          />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Options" light={false} />
        <CardBody className="bg-light">
          <p>
            {' '}
            You can pass options via Props through <code>CookieAlert</code> component. It will decide whether the notice
            is shown or remain hidden when the page loads.
          </p>
          <Table className="border border-200" bordered responsive>
            <thead className="bg-200 text-900">
              <tr>
                <th className="white-space-nowrap">Option</th>
                <th className="white-space-nowrap">Type</th>
                <th className="white-space-nowrap">Defaults</th>
                <th className="white-space-nowrap">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="white-space-nowrap">autoShow</td>
                <td className="white-space-nowrap">
                  {' '}
                  <code>Boolean</code>
                </td>
                <td className="white-space-nowrap">
                  {' '}
                  <code>false</code>
                </td>
                <td className="white-space-nowrap">
                  Set <code>true </code>to make the notice show automatically after the page is loaded.
                </td>
              </tr>
              <tr>
                <td className="white-space-nowrap">autoShowDelay</td>
                <td className="white-space-nowrap">
                  <code>Number </code>
                </td>
                <td className="white-space-nowrap">
                  {' '}
                  <code>0</code>
                </td>
                <td className="white-space-nowrap">
                  How much time <i>(ms) </i>should wait after the page is loaded before showing the notice. Works only
                  when the autoShow is set true
                </td>
              </tr>
              <tr>
                <td className="white-space-nowrap">showOnce</td>
                <td className="white-space-nowrap">
                  <code>Boolean</code>
                </td>
                <td className="white-space-nowrap">
                  <code>false</code>
                </td>
                <td className="white-space-nowrap">
                  The notice will show only once - for the first time when a user view the website and remain hidden as
                  per the cookie expiration date.
                </td>
              </tr>
              <tr>
                <td className="white-space-nowrap">cookieExpireTime</td>
                <td className="white-space-nowrap">
                  {' '}
                  <code>Number </code>
                </td>
                <td className="white-space-nowrap">
                  {' '}
                  <code>7200000</code>
                </td>
                <td className="white-space-nowrap">
                  After how many time <i>(ms) </i>the cookie will expired.
                </td>
              </tr>
            </tbody>
          </Table>
        </CardBody>
      </Card>
      <CookieAlert visible={visible} setVisible={setVisible} showOnce={false} onDismiss={onDismiss}>
        <img src={cookieImage} alt="" width={20} className="mr-2" />
        <p className="mb-2 mb-lg-0">
          Our site uses cookies. By continuing to use our site, you agree to our{' '}
          <a href="#!" className="text-underline">
            {' '}
            Cookie Policy
          </a>
          .
        </p>
        <Button color="primary" size="sm" className="ml-2" onClick={() => setVisible(false)}>
          Ok, I Understand
        </Button>
      </CookieAlert>
    </Fragment>
  );
};

export default CookieNotice;
