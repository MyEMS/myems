import React, { Fragment, useContext } from 'react';
import { Button, Card, CardBody, Media } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import vibrantImg from '../../assets/img/generic/vibrant.png';
// import card from '../../assets/img/generic/card.png';
// import vibrant from '../../assets/img/generic/vibrant.png';
import PageHeader from '../common/PageHeader';
import FalconCardHeader from '../common/FalconCardHeader';
import CodeHighlight from '../common/CodeHighlight';
import AppContext from '../../context/Context';

const SpinnersExample = () => {
  const { setNavbarStyle } = useContext(AppContext);
  return (
    <Fragment>
      <PageHeader
        title="Vertical Navbar"
        description="Here is the available built-in option of Falcon's powerful, responsive vertical navigation. The following sections describe how you can customize both the responsive breakpoint and collapsing behavior."
        className="mb-3"
      />
      <Card className="mb-3">
        <FalconCardHeader title="Responsive behavior" light={false} />
        <CardBody className="bg-light">
          Falcon used the reactstrap's <code>expand</code> property in <code>Navbar</code> component to decide when the
          navbar vertical will expand or not.
          <CodeHighlight
            language="html"
            code={`
              <Navbar color="light" light expand="md">
                  // content 
              </Navbar>`}
          />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="Collapsing behavior" light={false} />
        <CardBody className="bg-light">
          You can control the default collapsing behavior of Falcon's vertical navigation - whether it will show up with
          the collapsed or expanded state when the page loads. From your project directory,{' '}
          <code>src/context/Context.js</code> and set initial navbar collapse state like{' '}
          <code>isNavbarVerticalCollapsed: false</code> into <code>AppContext</code> then go to <code>src/Main.js</code>{' '}
          for set the value to the AppContext provider
          <CodeHighlight
            language="jsx"
            code={` const [isNavbarVerticalCollapsed, setIsNavbarVerticalCollapsed] = useState(getItemFromStore('isNavbarVerticalCollapsed', false));

  useEffect(() => {
    setItemToStore('isNavbarVerticalCollapsed', isNavbarVerticalCollapsed);
    // eslint-disable-next-line
  }, [isNavbarVerticalCollapsed]);
            
            `}
          />
        </CardBody>
      </Card>

      <hr className="my-4" />
      <PageHeader
        title="Navbar Styles"
        description="You can change the look of your Navbar Vertical in different styles. You can also customize your navbar vertical using SCSS variables. One of the navbar style example <code>vibrant</code>  given below:"
        className="mb-3"
      />
      <Card className="mb-3 mt-4">
        <CardBody>
          <Media>
            <Media middle href="#">
              <img src={vibrantImg} alt="" className="mr-3 border border-2x rounded-soft bg-200" width="100" />
            </Media>
            <Media body>
              <Media heading className="mb-0 contains-anchor">
                Navbar Vertical vibrant
              </Media>
              <p className="mb-1">
                You can update your Navbar Vertical <code>background-color</code> with Navbar Vertical vibrant.
              </p>
              <Button
                tag="a"
                href="#!"
                // target="_blank"
                color="link"
                size="sm"
                className="pl-0"
                onClick={() =>
                  setNavbarStyle(pre => {
                    if (pre === 'vibrant') {
                      return 'transparent';
                    } else {
                      return 'vibrant';
                    }
                  })
                }
              >
                See The implementation here
                <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
              </Button>
            </Media>
          </Media>
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="JSX" light={false} />
        <CardBody className="bg-light">
          Use <code>navbarStyle</code> prop to <code>NavbarVertical</code> component to change the navbar style.
          Example:
          <CodeHighlight language="jsx" code={`<NavbarVertical navbarStyle='vibrant' />`} />
        </CardBody>
      </Card>
      <Card className="mb-3">
        <FalconCardHeader title="SCSS" light={false} />
        <CardBody className="bg-light">
          Falcon allow you to customize your Navbar vibrant with SCSS variables. The available options are listed below:
          <h6 className="mt-3 fs-0">Background</h6>
          <p>
            To change the background only for the Navbar vibrant, add the inline CSS style to <code>Collapse</code> tag
            in <code>NavbarVertical.js</code> file.
          </p>
          <CodeHighlight
            language="jsx"
            code={`<Collapse
  navbar
  style={
    navbarStyle === 'vibrant' && {
      backgroundImage: linear-gradient(-45deg, rgba(0, 160, 255, 0.86), #0048a2),url(${'bgNavbarImg'})
    }
  }
>`}
          />
          <p className="my-3">
            For other navbar style add the SCSS variables <code>$navbar-inverted-bg, navbar-card-bg</code> in your
            <code>_user-variables.scss</code>. You can update both overlay color using this variable. Example:
          </p>
          <CodeHighlight
            language="scss"
            code={`$navbar-inverted-bg: $gray-1000;
$navbar-card-bg: $gray-1000`}
          />
          <h6 className="mt-5 fs-0">Navbar card shadow</h6>
          <p>
            To change the shadow of the Navbar Card, add the SCSS variable <code>$navbar-card-shadow</code> in your
            <code> _user-variables.scss.</code>. Example:
          </p>
          <CodeHighlight
            language="
          scss"
            code="$navbar-card-shadow:  $box-shadow;"
          />
          <h6 className="mt-5 fs-0">Link color</h6>
          <p>
            To change the color of the Navbar Vibrant links, add the SCSS variable{' '}
            <code>$navbar-vibrant-link-color</code> in your
            <code> _user-variables.scss.</code>. Example:
          </p>
          <CodeHighlight language="scss" code="$navbar-vibrant-link-color: $gray-500;" />
          <h6 className="mt-5 fs-0">Link hover color</h6>
          <p>
            To change the hover color of the Navbar Vibrant links, add the SCSS vairable{' '}
            <code>$navbar-vibrant-link-hover-color</code> in your
            <code>_user-variables.scss</code>. Example:
          </p>
          <CodeHighlight language="scss" code="$navbar-vibrant-link-hover-color: $gray-200;" />
          {/* Link active color */}
          <h6 className="mt-5 fs-0">Link active color</h6>
          <p>
            To change the active color of the Navbar Vibrant links, add the SCSS vairable{' '}
            <code>$navbar-vibrant-link-active-color</code> in your
            <code>_user-variables.scss</code>. Example:
          </p>
          <CodeHighlight language="scss" code="$navbar-vibrant-link-active-color: $gray-200;" />
          <h6 className="mt-5 fs-0">Navbar vibrant divider</h6>
          <p>
            To change the divider color, add the SCSS vairable <code>$navbar-vibrant-hr-color</code> in your
            <code>_user-variables.scss</code>. Example:
          </p>
          <CodeHighlight language="scss" code="$navbar-vibrant-hr-color: rgba($white, 0.2);" />
          <h6 className="mt-5 fs-0">Navbar vibrant scrollbar color</h6>
          <p>
            To change the scrollbar color, add the SCSS vairable <code>$navbar-vibrant-scrollbar-color</code> in your
            <code>_user-variables.scss</code>. Example:
          </p>
          <CodeHighlight language="scss" code="$navbar-vibrant-scrollbar-color: $gray-400;" />
          <p className="mt-4 font-weight-bold">
            For the <code>inverted</code> and <code>card</code> variation, please follow the same procedure.
          </p>
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default SpinnersExample;
