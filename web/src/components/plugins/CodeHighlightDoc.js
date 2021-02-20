import React, { Fragment } from 'react';
import PageHeader from '../common/PageHeader';
import { Button, Card, CardBody, Row, Col } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconEditor from '../common/FalconEditor';
import FalconCardHeader from '../common/FalconCardHeader';
import CodeHighlight from '../common/CodeHighlight';

const CodeHighlightHTML = `function CodeHightHTMLExample () {
  return (
    <CodeHighlight code={'<!DOCTYPE html><html lang="en" dir="ltr" ><head><meta charset="utf-8" /><link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="theme-color" content="#2c7be5" /><link rel="manifest" href="%PUBLIC_URL%/manifest.json" /><title>Falcon React | ReactJS Dashboard & WebApp Template</title></head><body><noscript>You need to enable JavaScript to run this app.</noscript><main class="main" id="main"></main></body></html>'} language="html" />
  )
}`;

const CodeHighlightDoc = () => {
  return (
    <Fragment>
      <PageHeader
        title="CodeHighlight"
        description="A lean <a href='https://github.com/PrismJS/prism' target='_blank'>Prism</a> highlighter component for React
        Comes with everything to render Prismjs highlighted code directly to React elements. Supported language:  <code> 
        html,
            markup,
          bash,
          clike,
          c,
          cpp,
          css,
          css-extras,
          javascript,
          jsx,
          js-extras,
          coffeescript,
          diff,
          git,
          go,
          graphql,
          handlebars,
          json,
          less,
          makefile,
          markdown,
          objectivec,
          ocaml,
          python,
          reason,
          sass,
          scss,
          sql,
          stylus,
          tsx,
          typescript,
          wasm,
          yaml
        </code>;"
        className="mb-3"
      >
        <Button
          tag="a"
          href="https://www.npmjs.com/package/prism-react-renderer"
          target="_blank"
          color="link"
          size="sm"
          className="pl-0"
        >
          prism-react-renderer Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Row noGutters>
        <Col lg={6} className="pr-lg-2 ">
          <Card>
            <FalconCardHeader title="HTML code highlight example" />
            <CardBody>
              <FalconEditor code={CodeHighlightHTML} scope={{ CodeHighlight }} language="jsx" />
            </CardBody>
          </Card>
          <Card className="mt-3">
            <FalconCardHeader title="Bash code highlight example" />

            <CardBody>
              <CodeHighlight code={`npm i && npm start `} language="bash" />
              <br />
              <CodeHighlight code={`yearn install && yearn start `} language="bash" />
            </CardBody>
          </Card>
        </Col>
        <Col lg={6} className="mt-lg-0 mt-3  pl-lg-2">
          <Card>
            <FalconCardHeader title="jsx code highlight example" />

            <CardBody>
              <CodeHighlight
                code={`import React from 'react';
import { Button, UncontrolledTooltip } from 'reactstrap';

const ToggleButton = ({ isNavbarVerticalCollapsed, setIsNavbarVerticalCollapsed }) => (
  <>
    <UncontrolledTooltip placement="left" target="toggleNavigationTooltip" innerClassName="p-2">
      Toggle Navigation
    </UncontrolledTooltip>
    <div className="toggle-icon-wrapper">
      <Button
        color="link"
        className="navbar-vertical-toggle border-0"
        id="toggleNavigationTooltip"
        onClick={() => {
          document.getElementsByTagName('html')[0].classList.toggle('navbar-vertical-collapsed');
          setIsNavbarVerticalCollapsed(!isNavbarVerticalCollapsed);
        }}
      >
        <span className="navbar-toggle-icon">
          <span className="toggle-line" />
        </span>
      </Button>
    </div>
  </>
);`}
                language="jsx"
              />
            </CardBody>
          </Card>

          <Card className="mt-3">
            <FalconCardHeader title="Scss code highlight example" />

            <CardBody>
              <CodeHighlight
                code={`/*-----------------------------------------------
|   Icons group
-----------------------------------------------*/
.icon-group{
  display: flex;
  .icon-item:not(:last-child){ margin-right: map_get($spacers, 2); }
}
.icon-item{
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: $gray-700;
  transition: $transition-base;
  height: 2.5rem;
  width: 2.5rem;
  border: 0;
  font-size: $font-size-sm;
  box-shadow: $box-shadow-sm;
  @include hover-focus{ background-color: $light; }
  &.icon-item-lg{
    height: 2.75rem;
    width: 2.75rem;
  }
}`}
                language="scss"
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default CodeHighlightDoc;
