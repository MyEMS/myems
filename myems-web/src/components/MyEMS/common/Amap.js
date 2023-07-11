import React, { useState, useEffect } from 'react';
import { Map, APILoader, ScaleControl, ToolBarControl, ControlBarControl, Geolocation,Marker } from '@uiw/react-amap';

const Amap = ({Longitude, Latitude, }) => {
  const [latitude, setLatitude] = useState(116.397428);
  const [longitude, setLongitude] = useState(39.90923);
  useEffect(() => {
    setLatitude(Longitude);
    setLongitude(Latitude);
  }, [Longitude, Latitude]);

  return (
    <>
      <APILoader version="2.0.5" akey="ff0f6de58a5165ac9d64701fad788114">
        <Map 
        zoom={10} 
        style={{ height: '100%', width: '100%' }} 
        center={[latitude, longitude]}
        >
          <ScaleControl offset={[16, 30]} position="LB" />
          <ToolBarControl offset={[16, 10]} position="RB" />
          <ControlBarControl offset={[16, 180]} position="RB" />
          <Geolocation
            maximumAge={100000}
            borderRadius="5px"
            position="RB"
            offset={[16, 80]}
            zoomToAccuracy={true}
            showCircle={true}
          />
          <Marker
          position={[latitude, longitude]}
        >
        </Marker>
        </Map>
      </APILoader>
    </>
  );
};

export default Amap;