import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const collapseExampleCode = `function CollapseExample() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div>
      <Button color="primary" onClick={() => setIsOpen(!isOpen)} style={{ marginBottom: '1rem' }}>Toggle</Button>
      <Collapse isOpen={isOpen}>
        <Card>
          <CardBody>
            Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.
          </CardBody>
        </Card>
      </Collapse>
    </div>
  );
}`;

const Collapses = () => (
  <Fragment>
    <PageHeader
      title="Collapse"
      description="Toggle the visibility of content with a few classes and Bootstrap's JavaScript plugins."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://reactstrap.github.io/components/collapse"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Collapse on reactstrap
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card>
      <FalconCardHeader title="Example" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={collapseExampleCode} scope={{ Link }} language="jsx" />
      </CardBody>
    </Card>
  </Fragment>
);

export default Collapses;
