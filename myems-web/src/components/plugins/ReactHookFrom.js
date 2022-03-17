import React, { Fragment } from 'react';
import { useForm } from 'react-hook-form';

import PageHeader from '../common/PageHeader';
import { Button, Card, CardBody, CardHeader } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconEditor from '../common/FalconEditor';
import classNames from 'classnames';

const ReactHookFormCode = ` function ReactHookFormExample (){
  const { register, handleSubmit, errors, watch } = useForm();

  const [formData, setData] = useState({});


  const OnSubmit = (data, e) => {
    setData(data);
  };

  return (
    <Row>
    <Col md={7}>
      <Form onSubmit={handleSubmit(OnSubmit)}>
        <FormGroup>
          <Label for="name">Name</Label>
          <Input
            type="text"
            name="name"
            id="name"
            placeholder="Enter your name"
            innerRef={register({
              required: 'required',
              minLength: {
                value: 2,
                message: 'Minimum two word'
              }
            })}
            className={classNames({ 'border-danger': errors.name })}
          />
          {errors.name && <span className="text-danger fs--1">{errors.name.message}</span>}
        </FormGroup>
        <FormGroup>
          <Label for="exampleEmail">Email</Label>
          <Input
            type="email"
            name="email"
            id="exampleEmail"
            placeholder="Enter your email"
            className={classNames({ 'border-danger': errors.email })}
            innerRef={register({
              required: 'Email is required',
              pattern: {
                value: /[A-Za-z0-9._%+-]{3,}@[a-zA-Z]{3,}([.]{1}[a-zA-Z]{2,}|[.]{1}[a-zA-Z]{2,}[.]{1}[a-zA-Z]{2,})/i,
                message: 'Email must be valid'
              }
            })}
          />
          {errors.email && <span className="text-danger fs--1">{errors.email.message}</span>}
        </FormGroup>
        <Row>
          <Col>
            <FormGroup>
              <Label for="password">Password</Label>
              <Input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
                innerRef={register({
                  required: 'You must specify a password',
                  minLength: {
                    value: 2,
                    message: 'Password must have at least 2 characters'
                  }
                })}
              />
              {errors.password && <span className="text-danger fs--1">{errors.password.message}</span>}
            </FormGroup>
          </Col>
          <Col>
            <FormGroup>
              <Label for="confirmPassord">Confirm Passord</Label>
              <Input
                type="password"
                name="confirmPassord"
                id="confirmPassord"
                placeholder="Confirm Password"
                innerRef={register({
                  validate: value => value === watch('password') || 'The password do not match'
                })}
              />
              {errors.confirmPassord && (
                <span className="text-danger fs--1">{errors.confirmPassord.message}</span>
              )}
            </FormGroup>
          </Col>
        </Row>
        <Button type="submit" color="primary">
          Submit
        </Button>
      </Form>
    </Col>
    <Col md="auto">
      <h5 className="mt-4">Result</h5>
      <pre>{JSON.stringify(formData, null, 2)}</pre>
    </Col>
  </Row>
  );
}`;

const ReactHookFrom = () => {
  return (
    <Fragment>
      <PageHeader
        title="React Hook Form"
        description="React Hook Form Performant, flexible and extensible forms with easy-to-use validation."
        className="mb-3"
      >
        <Button tag="a" href="https://www.react-hook-form.com/" target="_blank" color="link" size="sm" className="pl-0">
          React hook Form Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card>
        <CardHeader className="bg-light">
          <h4 className="mb-0">Example of form with validation</h4>
        </CardHeader>
        <CardBody>
          <FalconEditor code={ReactHookFormCode} scope={{ useForm, classNames }} language="jsx" />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default ReactHookFrom;
