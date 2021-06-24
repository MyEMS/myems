import React, { Fragment } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Card, CardBody } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';
import FalconCardHeader from '../common/FalconCardHeader';
import CodeHighlight from '../common/CodeHighlight';

const FontAwesome = () => (
  <Fragment>
    <PageHeader
      title="React Fontawesome"
      description="Font Awesome 5 React component using SVG with JS"
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://www.npmjs.com/package/@fortawesome/react-fontawesome"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        React Fontawesome on NPM
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
    </PageHeader>
    <Card className="mb-3">
      <FalconCardHeader title="Add Icon" />
      <CardBody>
        <p>
          For adding new icon, go to <code>src/helpers/initFA.js</code> file. We initialize all fontawesome icons here.
          Import your icon from your desired icon module and then pass it to <code>library.add()</code> function.
        </p>
        <CodeHighlight
          code={`import { library } from '@fortawesome/fontawesome-svg-core'
import { faGulp } from '@fortawesome/free-brands-svg-icons' // module
import { faCheckSquare, faHome } from '@fortawesome/free-solid-svg-icons' // module
 
library.add(faGulp, faCheckSquare, faHome)`}
          language="jsx"
        />
        <p className="mb-0 mt-3">
          For better understanding you can visit{' '}
          <a href="https://www.npmjs.com/package/@fortawesome/react-fontawesome#usage">fontawesome usage</a>
        </p>
      </CardBody>
    </Card>
    <Card>
      <FalconCardHeader title="Basic Usage" />
      <CardBody>
        <p>
          Now in your component file just import the <code>FontAwesomeIcon</code> component, and when you use it, supply
          the icon prop an icon name as a string
        </p>
        <CodeHighlight code={`import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';`} language="jsx" />
        <br />
        <FalconEditor
          code={`<FontAwesomeIcon icon="home" className="text-success fs-2" />`}
          scope={{ FontAwesomeIcon }}
          language="jsx"
        />
        <br />
        <FalconEditor
          code={`<FontAwesomeIcon icon={['fab', 'gulp']}  className="text-danger fs-4" />`}
          scope={{ FontAwesomeIcon }}
          language="jsx"
        />
      </CardBody>
    </Card>
  </Fragment>
);

export default FontAwesome;
