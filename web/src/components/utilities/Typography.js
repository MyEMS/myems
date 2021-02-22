import React, { Fragment } from 'react';
import { Card, CardHeader, CardBody, Row, Col } from 'reactstrap';
import PageHeader from '../common/PageHeader';
import FalconEditor from '../common/FalconEditor';
import FalconCardHeader from '../common/FalconCardHeader';

const fontFamilyCode = `<Fragment>
  <div className="text-sans-serif">Poppins</div>
  <div className="text-base">Open Sans</div>
  <code className="text-monospace">Monospace</code>
</Fragment>`;

const headingCode = `<Fragment>
  <h1>Heading 1</h1>
  <h2>Heading 2</h2>
  <h3>Heading 3</h3>
  <h4>Heading 4</h4>
  <h5>Heading 5</h5>
  <h6>Heading 6</h6>
</Fragment>`;

const paragraphCode = `<p>Your paragraph text goes here.</p>`;

const leadParagraphCode = `<p className="dropcap lead">
    Morem ipsum dolor sit amet, consectetur adipisicing elit. Ab accusamus at cumque deleniti dolores, est fugiat harum impedit ipsam, itaque iusto magnam natus neque, nulla placeat quis quod recusandae sapiente. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto atque consectetur culpa eos est exercitationem harum impedit iusto magnam molestiae neque non officia, pariatur possimus rem sapiente, sequi! Beatae, quae.
</p>`;

const fontWeightCode = `<Fragment>
  <div className="font-weight-thin">Hello World</div>
  <div className="font-weight-extra-light">Hello World</div>
  <div className="font-weight-light">Hello World</div>
  <div className="font-weight-normal">Hello World</div>
  <div className="font-weight-medium">Hello World</div>
  <div className="font-weight-semi-bold">Hello World</div>
  <div className="font-weight-bold">Hello World</div>
  <div className="font-weight-extra-bold">Hello World</div>
  <div className="font-weight-black">Hello World</div>
</Fragment>`;

const textColorsCode = `<Fragment>
  <h5 className="text-primary">.text-primary</h5>
  <h5 className="text-info">.text-info</h5>
  <h5 className="text-success">.text-success</h5>
  <h5 className="text-warning">.text-warning</h5>
  <h5 className="text-danger">.text-danger</h5>
  <h5 className="text-black">.text-black</h5>
  <h5 className="text-dark">.text-dark</h5>
  <h5 className="text-1000">.text-1000</h5>
  <h5 className="text-900">.text-900</h5>
  <h5 className="text-800">.text-800</h5>
  <h5 className="text-700">.text-700</h5>
  <h5 className="text-600">.text-600</h5>
  <h5 className="text-500">.text-500</h5>
  <h5 className="text-400">.text-400</h5>
  <h5 className="text-300"><span className="bg-black">.text-300</span></h5>
  <h5 className="text-200"><span className="bg-dark">.text-200</span></h5>
  <h5 className="text-light"><span className="bg-1000">.text-light</span></h5>
  <h5 className="text-white"><span className="bg-900">.text-white</span></h5>
</Fragment>`;

const fontSizeCode = `<Fragment>
  <h6 className="fs--2">.fs--2</h6>
  <h6 className="fs--1">.fs--1</h6>
  <h6 className="fs-0">.fs-0</h6>
  <h6 className="fs-1">.fs-1</h6>
  <h6 className="fs-2">.fs-2</h6>
  <h6 className="fs-4">.fs-4</h6>
  <h6 className="fs-5">.fs-5</h6>
  <h6 className="fs-6">.fs-6</h6>
  <h6 className="fs-7">.fs-7</h6>
  <h6 className="fs-8">.fs-8</h6>
</Fragment>`;

const leftAlignCode = `<div className="text-left">Pellentesque cursus placerat hendrerit. Donec sed erat nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce vitae consequat erat. Quisque faucibus felis et fringilla imperdiet. Etiam at porttitor elit, quis convallis massa. Ut id risus sapien. Praesent sit amet arcu a eros laoreet facilisis id eget risus.</div>`;
const rightAlignCode = `<div className="text-right">Pellentesque cursus placerat hendrerit. Donec sed erat nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce vitae consequat erat. Quisque faucibus felis et fringilla imperdiet. Etiam at porttitor elit, quis convallis massa. Ut id risus sapien. Praesent sit amet arcu a eros laoreet facilisis id eget risus.</div>`;
const centerAlignedCode = `<div className="text-center">Pellentesque cursus placerat hendrerit. Donec sed erat nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce vitae consequat erat. Quisque faucibus felis et fringilla imperdiet. Etiam at porttitor elit, quis convallis massa. Ut id risus sapien. Praesent sit amet arcu a eros laoreet facilisis id eget risus.</div>`;
const justifiedCode = `<div className="text-justify">Pellentesque cursus placerat hendrerit. Donec sed erat nulla. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce vitae consequat erat. Quisque faucibus felis et fringilla imperdiet. Etiam at porttitor elit, quis convallis massa. Ut id risus sapien. Praesent sit amet arcu a eros laoreet facilisis id eget risus.</div>`;

const tranformationCode = `<Fragment>
  <div className="text-lowercase">Lowercased text</div>
  <div className="text-uppercase">Uppercased text</div>
  <div className="text-capitalize">Capitalized text</div>
</Fragment>`;

const inlineStylesCode = `<Fragment>
  <p><mark>Highlight text</mark></p>
  <p><del>Deleted text</del></p>
  <p><u>Underlined text</u></p>
  <p><small>Small text</small></p>
  <p><strong>Bold text</strong></p>
  <p><i>Italic text</i></p>
</Fragment>`;

const blockquotesCode = `<blockquote className="blockquote my-3">
  <p className="fs-2 text-800 font-italic">Racing is life, everything before or after is just waiting.”</p>
  <footer className="blockquote-footer">Frank Zappa</footer>
</blockquote>`;

const unStyledListCode = `<ul className="list-unstyled">
  <li>Lorem ipsum dolor sit amet</li>
  <li>Consectetur adipiscing elit</li>
  <li>
    Nulla volutpat aliquam velit
    <ul className="list-unstyled pl-4">
      <li>Phasellus iaculis neque</li>
      <li>Purus sodales ultricies</li>
    </ul>
  </li>
  <li>Faucibus porta lacus fringilla vel</li>
</ul>`;

const checkmarkedCode = `<ul className="style-check">
  <li>Lorem ipsum dolor sit amet</li>
  <li>Consectetur adipiscing elit</li>
  <li>
    Nulla volutpat aliquam velit
    <ul>
      <li>Phasellus iaculis neque</li>
      <li>Purus sodales ultricies</li>
    </ul>
  </li>
  <li>Faucibus porta lacus fringilla vel</li>
</ul>`;

const Typography = () => (
  <Fragment>
    <PageHeader
      title="Typography"
      description="Documentation and examples for Falcon typography, including global settings, headings, body text, lists, and special typographic element."
      className="mb-3"
    />
    <Card className="mb-3">
      <CardHeader>
        <h5>Font Family</h5>
        <p className="mb-0">
          You have three <code>font-family </code> helper classes available to use.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={fontFamilyCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Headings</h5>
        <p className="mb-0">
          <strong>theme</strong> has all the html headings, <code>&lt;h1&gt;</code> through <code>&lt;h6&gt;</code>,
          styled for you. Also you can use <code>.h1</code> through <code>.h6</code> classes when you want to match the
          font styling of a heading but still want your text to be displayed inline.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={headingCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Paragraphs</h5>
        <p className="mb-0">
          This is a paragraph text. Following text are dummy copy text. Donec feugiat lorem dolor, eu fringilla urna
          tincidunt quis. In vitae dignissim lectus. Maecenas varius libero non metus rhoncus sagittis. Proin posuere
          iaculis auctor. Vivamus orci lorem, sollicitudin at convallis in, feugiat eget felis. Integer maximus, metus
          sit amet imperdiet semper, erat felis vulputate odio, nec malesuada metus.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={paragraphCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Lead Paragraph and Drop cap</h5>
        <p className="mb-0">
          Make a paragraph stand out by adding <code>.lead</code> and for drop cap, use <code>.dropcap</code> class.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={leadParagraphCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Font Weights" light={false} />
      <CardBody className="bg-light">
        <FalconEditor code={fontWeightCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Colors</h5>
        <p className="mb-0">Use the following colors to change the text color</p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={textColorsCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Sizes</h5>
        <p className="mb-0">If you want different sizes of fonts, you may use the following classes.</p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={fontSizeCode} />
      </CardBody>
    </Card>
    <Row noGutters>
      <Col sm={6} className="pr-sm-2 mb-3">
        <Card>
          <CardHeader>
            <h5 className="mb-0">Left Alignment</h5>
          </CardHeader>
          <CardBody className="bg-light">
            <FalconEditor code={leftAlignCode} />
          </CardBody>
        </Card>
      </Col>
      <Col sm={6} className="pl-sm-2 mb-3">
        <Card>
          <CardHeader>
            <h5 className="mb-0">Right Alignment</h5>
          </CardHeader>
          <CardBody className="bg-light">
            <FalconEditor code={rightAlignCode} />
          </CardBody>
        </Card>
      </Col>
      <Col sm={6} className="pr-sm-2 mb-3">
        <Card>
          <CardHeader>
            <h5 className="mb-0">Center Aligned</h5>
          </CardHeader>
          <CardBody className="bg-light">
            <FalconEditor code={centerAlignedCode} />
          </CardBody>
        </Card>
      </Col>
      <Col sm={6} className="pl-sm-2 mb-3">
        <Card>
          <CardHeader>
            <h5 className="mb-0">Justified</h5>
          </CardHeader>
          <CardBody className="bg-light">
            <FalconEditor code={justifiedCode} />
          </CardBody>
        </Card>
      </Col>
    </Row>
    <Card className="mb-3">
      <FalconCardHeader title="Transformation" />
      <CardBody>
        <FalconEditor code={tranformationCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Inline styles</h5>
        <p className="mb-0">
          Use these tags for inline styling. Feel free to use <code>&lt;b&gt;</code> and <code>&lt;em&gt;</code> tags
          insted of <code>&lt;strong&gt;</code> and <code>&lt;i&gt;</code> tags.
        </p>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={inlineStylesCode} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <CardHeader>
        <h5>Blockquotes</h5>
      </CardHeader>
      <CardBody className="bg-light">
        <FalconEditor code={blockquotesCode} />
      </CardBody>
    </Card>
    <Row noGutters>
      <Col sm={6} className="pr-sm-2 mb-3">
        <Card>
          <CardHeader>
            <h5 className="mb-0">Unordered List</h5>
          </CardHeader>
          <CardBody className="bg-light">
            <FalconEditor code={leftAlignCode} />
          </CardBody>
        </Card>
      </Col>
      <Col sm={6} className="pl-sm-2 mb-3">
        <Card>
          <CardHeader>
            <h5 className="mb-0">Ordered List</h5>
          </CardHeader>
          <CardBody className="bg-light">
            <FalconEditor code={rightAlignCode} />
          </CardBody>
        </Card>
      </Col>
      <Col sm={6} className="pr-sm-2 mb-3">
        <Card>
          <CardHeader>
            <h5 className="mb-0">Unstyled List</h5>
            <p className="mb-0">
              Adding <code>list-unstyled</code> class to <code>ul</code> element will produce the following list style:
            </p>
          </CardHeader>
          <CardBody className="bg-light">
            <FalconEditor code={unStyledListCode} />
          </CardBody>
        </Card>
      </Col>
      <Col sm={6} className="pl-sm-2 mb-3">
        <Card>
          <CardHeader>
            <h5 className="mb-0">Checkmarked List</h5>
            <p className="mb-0">
              Adding <code>style-check</code> class to <code>ul</code> element will produce the following list style:
            </p>
          </CardHeader>
          <CardBody className="bg-light">
            <FalconEditor code={checkmarkedCode} />
          </CardBody>
        </Card>
      </Col>
    </Row>
  </Fragment>
);

export default Typography;
