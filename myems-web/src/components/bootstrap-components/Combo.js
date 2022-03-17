import React, { Fragment, useContext } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import AppContext from '../../context/Context';

const Combo = () => {
  const { setIsOpenSidePanel } = useContext(AppContext);

  return (
    <Fragment>
      <PageHeader
        title="Combo Nav"
        description="Combo Nav is an additional layout system of Falcon where you can place both Navbar Top and Navbar Vertical in a same page."
        className="mb-3"
      >
        <Button
          onClick={() => {
            setIsOpenSidePanel(pre => !pre);
          }}
          color="link"
          size="sm"
          className="pl-0"
        >
          Toggle Combo Nav on Side panel
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card className="mb-3">
        <FalconCardHeader title="Supported Content" light={false} />
        <CardBody className="bg-light">
          <p>
            Combo layout uses Falcon's{' '}
            <a href="/components/navbar-vertical" target="_blank">
              Navbar vertical{' '}
            </a>
            and{' '}
            <a href="/components/navbar-top" target="_blank">
              Navbar top
            </a>
            .
          </p>
          <p className="mb-0">
            To enable Combo layout set <code>isCombo</code> to true in <code>src/config.js</code> file.
          </p>
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Behaviors" light={false} />
        <CardBody className="bg-light">
          {' '}
          <p className="mb-0">
            For responsive collapsing pass <code>{`expand = {'sm | md | lg | xl'}`}</code> prop to reactstrap{' '}
            <code>Navbar</code> component.
          </p>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Combo;
