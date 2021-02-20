import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Card, CardBody, CardFooter } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PageHeader from '../common/PageHeader';
import faqs from '../../data/faq/faqs';

const QAs = ({ question, answer, divider }) => (
  <Fragment>
    <h6>
      <Link to="#!">
        {question}
        <FontAwesomeIcon icon="caret-right" transform="right-7" />
      </Link>
    </h6>
    <p className="fs--1 mb-0">{answer}</p>
    {divider && <hr className="my-3" />}
  </Fragment>
);

QAs.propTypes = {
  question: PropTypes.string,
  answer: PropTypes.string,
  divider: PropTypes.bool
};

QAs.defaultProps = { divider: true };

const Faq = () => (
  <Fragment>
    <PageHeader
      title="Frequently Asked Questions"
      description="Below you'll find answers to the questions we get<br/>asked the most about to join with Falcon"
      className="mb-3"
    />
    <Card>
      <CardBody>
        {faqs.map((faq, index) => (
          <QAs {...faq} key={index} />
        ))}
      </CardBody>
      <CardFooter className="d-flex align-items-center bg-light">
        <h5 className="d-inline-block mr-3 mb-0 fs--1">Was this information helpful?</h5>
        <Button color="falcon-default" size="sm">
          Yes
        </Button>
        <Button color="falcon-default" size="sm" className="ml-2">
          No
        </Button>
      </CardFooter>
    </Card>
  </Fragment>
);

export default Faq;
