import React, { Fragment } from 'react';
import { Button, Card, CardBody } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FalconCardHeader from '../common/FalconCardHeader';
import FalconEditor from '../common/FalconEditor';
import PageHeader from '../common/PageHeader';
import GoogleMap from '../map/GoogleMap';
import { getItemFromStore } from '../../helpers/utils';

const googleMapCode = `<GoogleMap
  initialCenter={{
    lat: 48.8583736,
    lng: 2.2922926
  }}
  mapStyle={ getItemFromStore('isDark') ? 'Midnight' : 'Default' }
  className="min-vh-50 rounded-soft"
>
  <h5>Eiffel Tower</h5>
  <p>
    Gustave Eiffel's iconic, wrought-iron 1889 tower,
    <br />
    with steps and elevators to observation decks.
  </p>
</GoogleMap>`;

const propertiesCode = `GoogleMap.propTypes = {
  mapStyle: PropTypes.oneOf([
    'Default',
    'Gray',
    'Midnight',
    'Hopper',
    'Beard',
    'AssassianCreed',
    'SubtleGray',
    'Tripitty'
  ]),
  className: PropTypes.string,
  children: PropTypes.node,
  ...Map.propTypes
};`;

const GoogleMapExample = () => (
  <Fragment>
    <PageHeader
      title="Google Maps React"
      description="A declarative Google Map React component using React, lazy-loading dependencies, current-location finder and a test-driven approach by the Fullstack React team."
      className="mb-3"
    >
      <Button
        tag="a"
        href="https://github.com/fullstackreact/google-maps-react"
        target="_blank"
        color="link"
        size="sm"
        className="pl-0"
      >
        Google Maps React Documentation
        <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
      </Button>
      <GoogleMap />
    </PageHeader>
    <Card className="mb-3">
      <FalconCardHeader title="Example" />
      <CardBody>
        <FalconEditor code={googleMapCode} scope={{ GoogleMap, getItemFromStore }} />
      </CardBody>
    </Card>
    <Card className="mb-3">
      <FalconCardHeader title="Properties" />
      <CardBody>
        <FalconEditor code={propertiesCode} scope={{ GoogleMap }} hidePreview />
        <FalconEditor
          code={`GoogleMap.defaultProps = { zoom: 17, mapStyle: 'Default' };`}
          scope={{ GoogleMap }}
          language="jsx"
          hidePreview
        />
      </CardBody>
    </Card>
  </Fragment>
);

export default GoogleMapExample;
