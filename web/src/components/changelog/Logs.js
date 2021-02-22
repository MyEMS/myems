import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Card, CardBody, CardHeader } from 'reactstrap';
import { isIterableArray } from '../../helpers/utils';
import changeLogs from './changeLogs';
import createMarkup from '../../helpers/createMarkup';

const Logs = ({ title, publish, logs, children, index: currentIndex }) => (
  <Card className="mb-3">
    <CardHeader>
      <h5>{title}</h5>
      <p className="mb-0">{publish}</p>
    </CardHeader>
    <CardBody className="bg-light">
      {children}
      {isIterableArray(Object.keys(logs)) &&
        Object.keys(logs).map((value, index) => {
          return value === 'Migration' ? (
            <Fragment key={index}>
              <h5 className="fs-0">
                {value}:{' '}
                <strong>
                  <code>v{changeLogs[currentIndex + 1].title.split(' - ')[0]}</code>
                </strong>{' '}
                to{' '}
                <strong>
                  <code>v{title.split(' - ')[0]}</code>
                </strong>
              </h5>
              <ul className="pl-3">
                {Object.entries(logs[value]).map((entry, i) => (
                  <li key={i}>
                    <h6>{entry[0]}</h6>
                    <ul>
                      {isIterableArray(entry[1]) &&
                        entry[1].map((mv, mi) => (
                          <li dangerouslySetInnerHTML={{ __html: mv }} key={entry[0] + i + mi} />
                        ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </Fragment>
          ) : (
            <Fragment key={index}>
              <h5 className="fs-0">{value}</h5>
              <ul className="pl-3">
                {logs[value].map((v, i) => (
                  <li key={i} dangerouslySetInnerHTML={createMarkup(v)} />
                ))}
              </ul>
            </Fragment>
          );
        })}
    </CardBody>
  </Card>
);

Logs.propTypes = {
  title: PropTypes.string.isRequired,
  publish: PropTypes.string.isRequired,
  logs: PropTypes.object.isRequired,
  children: PropTypes.node
};

Logs.defaultProps = { logs: {} };

export default Logs;
