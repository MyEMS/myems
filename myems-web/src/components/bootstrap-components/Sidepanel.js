import React, { Fragment, useContext } from 'react';
import { Button, Card, CardBody, Table } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import CodeHighlight from '../common/CodeHighlight';
import AppContext from '../../context/Context';

const Sidepanel = () => {
  const { toggleModal } = useContext(AppContext);
  return (
    <Fragment>
      <PageHeader
        title="Sidepanel"
        description="You can show lists, forms, notifications, or other custom contents into the Falcon Sidepanel."
        className="mb-3"
      >
        <Button
          tag="a"
          href="#!"
          color="link"
          size="sm"
          className="pl-0"
          onClick={() => {
            toggleModal();
          }}
        >
          Show Sidepanel
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card className="mb-3">
        <FalconCardHeader title="Structure" light={false} />
        <CardBody className="bg-light">
          <p>
            Falcon Sidepanel uses Boostrap Modal features to show the panel content. <code>.modal-fixed-right</code> and
            <code>.modal-dialog-vertical</code> classes are used to stick the panel at the right side and animate the
            panel from right to left.
          </p>
          <CodeHighlight
            language="html"
            code={`
              <Modal
                isOpen={isOpenSidePanel}
                toggle={toggleModal}
                modalClassName="overflow-hidden modal-fixed-right modal-theme"
                className="modal-dialog-vertical"
              >
                <ModalHeader tag="div" toggle={toggleModal} className="modal-header-settings">
                  // Heder Content
                </ModalHeader>
                  <ModalBody className="px-card">
                    //Body Content
                  </ModalBody>
              </Modal>`}
          />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Options" light={false} />
        <CardBody className="bg-light">
          <p>
            {' '}
            You can pass options via Props through <code>Sidepanel</code> component. It will decide whether the panel is
            shown or remain hidden when the page loads.
          </p>
          <Table class="border border-200 fs--1" bordered responsive>
            <thead class="bg-200 text-900">
              <tr>
                <th class="white-space-nowrap">Option</th>
                <th class="white-space-nowrap">Type</th>
                <th class="white-space-nowrap">Defaults</th>
                <th class="white-space-nowrap">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="white-space-nowrap">autoShow</td>
                <td class="white-space-nowrap">
                  {' '}
                  <code>Boolean</code>
                </td>
                <td class="white-space-nowrap">
                  {' '}
                  <code>false</code>
                </td>
                <td class="white-space-nowrap">
                  Set <code>true </code>to make the Slidepanel show automatically after the page is loaded.
                </td>
              </tr>
              <tr>
                <td class="white-space-nowrap">autoShowDelay</td>
                <td class="white-space-nowrap">
                  <code>Number </code>
                </td>
                <td class="white-space-nowrap">
                  {' '}
                  <code>3000</code>
                </td>
                <td class="white-space-nowrap">
                  How much time <i>(ms) </i>should wait after the page is loaded before showing the Sidepanel. Works
                  only when the autoShow is set true
                </td>
              </tr>
              <tr>
                <td class="white-space-nowrap">showOnce</td>
                <td class="white-space-nowrap">
                  <code>Boolean</code>
                </td>
                <td class="white-space-nowrap">
                  <code>false</code>
                </td>
                <td class="white-space-nowrap">
                  The Sidepanel will show only once - for the first time when a user view the website and remain hidden
                  as per the cookie expiration date.
                </td>
              </tr>
              <tr>
                <td class="white-space-nowrap">cookieExpireTime</td>
                <td class="white-space-nowrap">
                  {' '}
                  <code>Number </code>
                </td>
                <td class="white-space-nowrap">
                  {' '}
                  <code>7200000</code>
                </td>
                <td class="white-space-nowrap">
                  After how many time <i>(ms) </i>the cookie will expired.
                </td>
              </tr>
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Sidepanel;
