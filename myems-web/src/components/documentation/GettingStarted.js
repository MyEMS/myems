import React, { Fragment } from 'react';
import { Card, CardBody, CardHeader, NavLink } from 'reactstrap';
import CodeHighlight from '../common/CodeHighlight';
import FalconCardHeader from '../common/FalconCardHeader';
import PageHeader from '../common/PageHeader';

const GettingStarted = () => (
  <Fragment>
    <PageHeader title="Getting Started" className="mb-3">
      <p className="mt-2 mb-0">
        Welcome to the ReactJS version of the{' '}
        <a
          href="https://myems.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          original MyEMS
        </a>
        . This doc will guide you to understand how <strong>Falcon-React</strong> theme is organized, basics of how to
        customize, and how to compile from the source code if you want.
      </p>
    </PageHeader>

    <Card className="mb-3">
      <FalconCardHeader title="Running in Local environment" />
      <CardBody>
        <p>
          This project is scaffolded using{' '}
          <a href="https://create-react-app.dev" target="_blank" rel="noopener noreferrer">
            Create React App
          </a>
          .
        </p>
        <ol className="mb-0 pl-card">
          <li>
            Install{' '}
            <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">
              Node.js
            </a>{' '}
            if you do not already have it installed on your machine.
          </li>
          <li>Open the “falcon-react” directory with your cmd or terminal</li>
          <li>
            Run <code>npm i</code>
            <br />
            This command will download all the necessary dependencies for falcon in the <code>node_modules</code>{' '}
            directory.
          </li>
          <li>
            Run <code>npm start</code>
            <br />A local web server will start at <code>http://localhost:3000</code>.<br />
            We are using webpack and webpack-serve to automatically detect file changes. So, if you edit and save a
            file, your browser will automatically refresh and preview the change.
          </li>
        </ol>
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Creating a Production Build" />
      <CardBody>
        <p>
          After you done your customization, when you are ready to build, Run <code>npm run build</code> command in your
          project directory to make the Production build.
        </p>
        <p>
          This will create an optimized production build by compililing, merging and minifying all the source files as
          necessary and put them in the <code>build/</code> folder.
        </p>
        <p>
          You can run <code>node server.js</code> to run the production build locally at{' '}
          <code>http://localhost:5000</code>.
        </p>
      </CardBody>
    </Card>

    <Card className="mb-3">
      <FalconCardHeader title="Compiling SCSS" />
      <CardBody>
        <p>
          Run <code>npm run scss</code> command in your project directory to compile scss. This will compile all the
          SCSS files from <code>src/assets/scss/</code> directory and generate <code>theme.css</code>,{' '}
          <code>theme.css.map</code>, <code>theme-rtl.css</code>, <code>theme-rtl.css.map</code> files in{' '}
          <code>public/css/</code> directory. Reload your browser to see the changes.
        </p>
        <p>
          <strong>
            You can also use the SCSS watcher to automatically compile and reload your browser every time you save your
            SCSS files by running the command
          </strong>{' '}
          <code>npm run scss</code>
          <strong> in a separate terminal window while running</strong> <code>npm start</code>{' '}
          <strong> in another.</strong>
        </p>
        <p>
          You can add your own SCSS and override the theme style in the <code>_user.scss</code> file.
        </p>
        <p className="mb-0">
          To make broader changes to the design of the theme, such as changing the color scheme or font sizes, use{' '}
          <code>src/assets/scss/_user-variables.scss</code>. Any variable from{' '}
          <code>node_modules/bootstrap/scss/_variables.scss</code> or <code>src/assets/scss/theme/_variables.scss</code>{' '}
          can be overridden with your own value.
        </p>
      </CardBody>
    </Card>
    <Card className="mb-3" id="setting-config">
      <CardHeader className="bg-light">
        <NavLink href="#setting-config" className="font-weight-semi-bold fs-1  p-0 text-900">
          Settings configuration
        </NavLink>
      </CardHeader>
      <CardBody>
        <p>
          Control side panel settings from one place. Go to <code>src/config.js</code> file and set your setting
          configuration.
        </p>
        <CodeHighlight
          code={`export const version = '2.8.0';
export const navbarBreakPoint = 'xl'; // Vertical navbar breakpoint
export const topNavbarBreakpoint = 'lg';
export const settings = {
  isFluid: false,
  isRTL: false,
  isDark: true,
  isTopNav: true,
  isVertical: false,
  get isCombo() {
    return this.isVertical && this.isTopNav;
  },
  showBurgerMenu: false, // controls showing vertical nav on mobile
  currency: '$',
  isNavbarVerticalCollapsed: false, // toggle vertical navbar collapse
  navbarStyle: 'transparent'
};
export default { version, navbarBreakPoint, topNavbarBreakpoint, settings };`}
          language="jsx"
        />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Contents" />
      <CardBody>
        <p className="mb-0">
          Inside the zip-file you'll find the following directories and files. Both compiled and minified distrubution
          files, as well as the source files are included in the package.
        </p>
        <code>
          <pre>
            {`
theme/
  ├── .browserslistrc
  ├── .env
  ├── .eslintrc.json
  ├── .gitignore
  ├── .gitlab-ci.yml
  ├── .prettierrc
  ├── gulpfile.js
  ├── package.json
  ├── package-lock.json
  ├── README.md
  ├── build/
  ├── public/
  │   ├── css/
  │   ├── favicon.ico
  │   ├── index.html
  │   └── manifest.json
  └── src/
      ├── assets/
      │   ├── img/
      │   ├── scss/
      │   └── video/
      ├── components/
      ├── contex/
      ├── data/
      ├── helpers/
      ├── hoc/
      ├── hooks/
      ├── layouts/
      ├── App.js
      ├── config.js
      ├── index.js
      ├── Main.js
      └── routes.js
`}
          </pre>
        </code>
      </CardBody>
    </Card>
  </Fragment>
);

export default GettingStarted;
