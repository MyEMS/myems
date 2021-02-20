import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Col,
  Form,
  FormGroup,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row
} from 'reactstrap';
import Loader from '../common/Loader';
import rawFaqs from '../../data/faq/faqs';
import FalconCardHeader from '../common/FalconCardHeader';
import { isIterableArray } from '../../helpers/utils';
import useFakeFetch from '../../hooks/useFakeFetch';

const AskQuestionForm = () => (
  <Form>
    <FormGroup>
      <Label for="name">Name</Label>
      <Input id="name" />
    </FormGroup>
    <FormGroup>
      <Label for="emailModal">Email Address</Label>
      <Input id="emailModal" type="email" />
    </FormGroup>
    <FormGroup>
      <Label for="question">Question</Label>
      <Input type="textarea" id="question" rows="4" />
    </FormGroup>
  </Form>
);

const Faq = ({ question, answer }) => (
  <Fragment>
    <h5 className="fs-0">{question}</h5>
    <p className="fs--1">{answer}</p>
  </Fragment>
);

Faq.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired
};

const FaqCol = () => {
  const { loading, data: faqs } = useFakeFetch(rawFaqs);
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => setIsOpen(!isOpen);

  return (
    <Card>
      <FalconCardHeader title="Frequently asked questions" light={false} />
      <CardBody className="bg-light">
        {loading ? (
          <Loader />
        ) : (
          <Row>
            <Col lg={6}>
              {isIterableArray(faqs) && faqs.slice(0, 4).map((faq, index) => <Faq {...faq} key={index} />)}
            </Col>
            <Col lg={6}>{isIterableArray(faqs) && faqs.slice(4).map((faq, index) => <Faq {...faq} key={index} />)}</Col>
          </Row>
        )}
      </CardBody>
      <CardFooter className="text-center py-4">
        <h6 className="fs-0 font-weight-normal">Have more questions?</h6>
        <Button color="falcon-primary" size="sm" onClick={toggleModal}>
          Ask us anything
        </Button>
        <Modal isOpen={isOpen} toggle={toggleModal} centered>
          <ModalHeader>Ask your question</ModalHeader>
          <ModalBody>
            <AskQuestionForm />
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" size="sm" onClick={toggleModal}>
              Close
            </Button>
            <Button color="primary" size="sm" onClick={toggleModal}>
              Send Question
            </Button>
          </ModalFooter>
        </Modal>
      </CardFooter>
    </Card>
  );
};

export default FaqCol;
