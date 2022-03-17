import React, { Fragment } from 'react';
import { Alert, Card, CardBody, Media } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CodeHighlight from '../common/CodeHighlight';

import Logs from './Logs';

import changeLogs from './changeLogs';

const Changelog = () => (
  <Fragment>
    <PageHeader title="Changelog" className="mb-3" />
    <Card className="mb-3">
      <CardBody>
        <Alert color="warning" className="p-4 mb-0">
          <Media>
            <FontAwesomeIcon icon="exclamation-triangle" className="fs-3" />
            <Media body className="ml-3">
              <h4 className="alert-heading">Before you update!</h4>
              Backup your files and read the changelog before updating MyEMS on your project. If you come across with
              any problems during the update, feel free to contact us at{' '}
              <a href="https://myems.io">https://myems.io</a>.
            </Media>
          </Media>
        </Alert>
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardBody>
        <Alert color="info" className="p-4 mb-0 bg-white">
          <Media>
            <FontAwesomeIcon icon="tools" className="fs-3" />
            <Media body className="ml-3">
              <h4 className="alert-heading">After you update</h4>

              <p className="mb-0">
                After successfully updating all the latest files and changes from a new version of MyEMS, 
                you need to run the following commands in your project directory. These commands will
                install the updated versions of all dependencies, install if any new dependencies are required, and run
                the project.
              </p>
              <h6 className="mt-3">
                If you use{' '}
                <strong>
                  <code>yarn</code>
                </strong>{' '}
                , run:
              </h6>
              <CodeHighlight code={`yarn install && yarn start`} language="bash" />
              <h6 className="mt-3">
                If you use{' '}
                <strong>
                  <code>npm</code>
                </strong>{' '}
                , run:
              </h6>
              <CodeHighlight code={`npm i && npm start`} language="bash" />
            </Media>
          </Media>
        </Alert>
      </CardBody>
    </Card>
    {changeLogs.map((logs, index) => (
      <Logs {...logs} index={index} key={index} />
    ))}
  </Fragment>
);

export default Changelog;
