import React, { Fragment } from 'react';
import { Card, CardHeader, CardBody, Col, Row } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';

const additiveBorderCode = `<Fragment>
  <span className="border" />
  <span className="border-top" />
  <span className="border-right" />
  <span className="border-bottom" />
  <span className="border-left" />
</Fragment>`;

const subtrativeBorderCode = `<Fragment>
  <span className="border border-0" />
  <span className="border border-top-0" />
  <span className="border border-right-0" />
  <span className="border border-bottom-0" />
  <span className="border border-left-0" />
</Fragment>`;

const borderColorCode = `<Fragment>
  <span className="border border-primary" />
  <span className="border border-secondary" />
  <span className="border border-success" />
  <span className="border border-danger" />
  <span className="border border-warning" />
  <span className="border border-info" />
  <span className="border border-light" />
  <span className="border border-dark" />
  <span className="border border-white" />
</Fragment>`;

const borderRadiusCode = `<Fragment>
  <span className="rounded-0" />
  <span className="rounded" />
  <span className="rounded-soft" />
  <span className="rounded-circle" />
</Fragment>`;

const borderDashedCode = `<Fragment>
  <span className="border-dashed"></span>
  <span className="border-dashed-top"></span>
  <span className="border-dashed-right"></span>
  <span className="border-dashed-bottom"></span>
  <span className="border-dashed-left"></span>
</Fragment>`;

const borderWidthWithColorCode = `<Fragment>
  <span className="border border-info"></span>
  <span className="border border-success"></span>
  <span className="border border-warning"></span>
  <span className="border border-danger"></span>
  <span className="border border-stunning"></span>
  <span className="border border-cake"></span>
  <span className="border border-facebook"></span>
  <span className="border border-twitter"></span>
  <span className="border border-google-plus"></span>
  <span className="border border-github"></span>
  <div className="w-100"></div>
  <span className="border border-black"></span>
  <span className="border border-dark"></span>
  <span className="border border-1100"></span>
  <span className="border border-1000"></span>
  <span className="border border-900"></span>
  <span className="border border-800"></span>
  <span className="border border-700"></span>
  <span className="border border-600"></span>
  <span className="border border-500"></span>
  <span className="border border-400"></span>
  <span className="border border-300"></span>
  <span className="border border-200"></span>
  <span className="border border-100"></span>
  <span className="border border-light"></span>
  <span className="border border-white"></span>
  <span className="border border-2x"></span>
</Fragment>`;

const Borders = () => (
  <Fragment>
    <PageHeader
      title="Borders"
      description="Use border utilities to quickly style the border and border-radius of an element. Great for images, buttons, or any other element."
      className="mb-3"
    />
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-0">Border</h5>
        <p>
          The classes are named using the format <code>border-{'{side}'}</code> for <code>xs</code> and
          <code> border-{'{breakpoint}-{side}'}</code> for <code>sm</code>, <code>md</code>, <code>lg</code>, and
          <code> xl</code>.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <p>
          Where <em>side</em> is one of:
        </p>
        <ul>
          <li>
            <code>top</code> - for classes that set style for <code>border-top</code>
          </li>
          <li>
            <code>bottom</code> - for classes that set style for <code>border-bottom</code>
          </li>
          <li>
            <code>left</code> - for classes that set style for <code>border-left</code>
          </li>
          <li>
            <code>right</code> - for classes that set style for <code>margin-right</code>
          </li>
          <li>
            <code>x</code> - for classes that set both <code>*-left</code> and <code>*-right</code>
          </li>
          <li>
            <code>y</code> - for classes that set both <code>*-top</code> and <code>*-bottom</code>
          </li>
          <li>
            blank - for classes that set the <code>border</code> style on all 4 side of the element.
          </li>
        </ul>
        <p>
          Use border utilities to quickly style the <code>border</code> of an element. Great for images, buttons, or any
          other element.
        </p>
      </CardBody>
    </Card>
    <Row noGutters className="mb-3">
      <Col md={6} className="pr-md-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="Additive" light={false} />
          <CardBody className="bg-light border-component">
            <FalconEditor code={additiveBorderCode} />
          </CardBody>
        </Card>
      </Col>
      <Col md={6} className="pl-md-2 mb-3">
        <Card className="h-100">
          <FalconCardHeader title="Subtractive" light={false} />
          <CardBody className="bg-light border-component">
            <FalconEditor code={subtrativeBorderCode} />
          </CardBody>
        </Card>
      </Col>
      <Col md={6} className="pr-md-2">
        <Card className="h-100">
          <CardHeader>
            <h5 className="mb-1">Border Color</h5>
            <p className="mb-0">Change the border color using utilities built on our theme colors</p>
          </CardHeader>
          <CardBody className="bg-light border-component">
            <FalconEditor code={borderColorCode} />
          </CardBody>
        </Card>
      </Col>
      <Col md={6} className="pl-md-2">
        <Card className="h-100">
          <CardHeader>
            <h5 className="mb-1">Border Radius</h5>
            <p className="mb-0">Add classes to an element to easily round its corners.</p>
          </CardHeader>
          <CardBody className="bg-light border-component">
            <FalconEditor code={borderRadiusCode} />
          </CardBody>
        </Card>
      </Col>
    </Row>
    <Card className="mb-3">
      <CardHeader>
        <h5 className="mb-1">Border Style</h5>
        <p className="mb-0">
          For the dashed border, the classes are named using the format, <code>border-dashed-side</code> for
          <code>xs</code> and <code>border-breakpoint-dashed-side</code> for <code>sm</code>, <code>md</code>
          <code>lg</code>, <code>xl</code> and <code>xxl</code>.
        </p>
        <p>
          Where <em>side</em> is same as documented before.
        </p>
      </CardHeader>
      <CardBody className="bg-light border-component">
        <FalconEditor code={borderDashedCode} />
      </CardBody>
    </Card>
    <Card>
      <CardHeader>
        <h4>Border color and width</h4>
        <p>
          Border color set as <code>currentColor</code> and border width <code>1px</code>. Modifier can be used to
          change border color and width. The modifier classes for color are named using the format{' '}
          <code>border-color</code> and for width <code>border-2x</code>.
        </p>
        <p>
          Where<em> color</em> is one of: <code>primary</code>, <code>secondary</code>, <code>success</code>,{' '}
          <code>info</code>, <code>warning</code>, <code>danger</code>, <code>light</code>, <code>dark</code>,{' '}
          <code>black</code>, <code>1100</code>, <code>1000</code>, <code>900</code>, <code>800</code>, <code>700</code>
          , <code>600</code>, <code>500</code>, <code>400</code>, <code>300</code>, <code>200</code>, <code>100</code>,{' '}
          <code>white</code>,
        </p>
      </CardHeader>
      <CardBody className="bg-light border-component">
        <FalconEditor code={borderWidthWithColorCode} />
      </CardBody>
    </Card>
  </Fragment>
);

export default Borders;
