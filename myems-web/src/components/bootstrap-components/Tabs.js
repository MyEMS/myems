import React from 'react';
import { Card, Button, CardHeader, CardBody } from 'reactstrap';
import classnames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';

const basicExampleCode = `function Tab () {

  const [activeTab, setActiveTab] = useState('1');

  const toggle = tab => {
    if (activeTab !== tab) setActiveTab(tab);
  };

  return (
    <>
      <Nav tabs>
        <NavItem className='cursor-pointer'>
          <NavLink
            className={classnames({ active: activeTab === '1' })}
            onClick={() => {
              toggle('1');
            }}
          >
            Tab1
          </NavLink>
        </NavItem>
        <NavItem className='cursor-pointer'>
          <NavLink
            className={classnames({ active: activeTab === '2' })}
            onClick={() => {
              toggle('2');
            }}
          >
            More Tabs
          </NavLink>
        </NavItem>
    </Nav>
    <TabContent activeTab={activeTab}>
      <TabPane tabId="1" >
        <Row>
          <Col sm="12 mt-4">
            <h4>Tab 1 Contents</h4>
          </Col>
        </Row>
      </TabPane>
      <TabPane tabId="2">
        <Row className='mt-4'>
          <Col sm="6">
            <Card body>
              <CardTitle>Special Title Treatment</CardTitle>
              <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
              <Button>Go somewhere</Button>
            </Card>
          </Col>
          <Col sm="6">
            <Card body>
              <CardTitle>Special Title Treatment</CardTitle>
              <CardText>With supporting text below as a natural lead-in to additional content.</CardText>
              <Button>Go somewhere</Button>
            </Card>
          </Col>
        </Row>
      </TabPane>
    </TabContent>
  </>
  )
}`;

const Tabs = () => {
  return (
    <>
      <PageHeader
        title="Tabs"
        description="Takes the basic nav and adds the tab prop to generate a tabbed interface. Use them to create tab able regions with our tab JavaScript plugin."
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://reactstrap.github.io/components/tabs/"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          Tab on reactstrap
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card>
        <CardHeader>
          <h5 className="mb-0">Example</h5>
        </CardHeader>
        <CardBody className="bg-light">
          <FalconEditor code={basicExampleCode} scope={{ classnames }} />
        </CardBody>
      </Card>
    </>
  );
};

export default Tabs;
