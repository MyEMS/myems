import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';
import classNames from 'classnames';
import googleMapStyles from '../../helpers/googleMapStyles';

const GoogleMap = ({ mapStyle, className, children, ...rest }) => {
  const [activeMarker, setActiveMarker] = useState({});
  const [showingInfoWindow, setShowingInfoWindow] = useState(false);

  const onMarkerClick = (props, marker) => {
    setActiveMarker(marker);
    setShowingInfoWindow(true);
  };

  const onInfoWindowClose = () => {
    setActiveMarker(null);
    setShowingInfoWindow(false);
  };

  return (
    <div className={classNames('position-relative', className)}>
      <Map styles={googleMapStyles[mapStyle]} {...rest}>
        <Marker onClick={onMarkerClick} />

        {children && (
          <InfoWindow marker={activeMarker} onClose={onInfoWindowClose} visible={showingInfoWindow}>
            <Fragment>{children}</Fragment>
          </InfoWindow>
        )}
      </Map>
    </div>
  );
};

GoogleMap.propTypes = {
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
};

GoogleMap.defaultProps = { zoom: 17, mapStyle: 'Default' };

// TODO: Do you provide the apiKey in production, instruct user to use his own apiKey
export default GoogleApiWrapper({ apiKey: 'AIzaSyARdVcREeBK44lIWnv5-iPijKqvlSAVwbw' })(GoogleMap);
