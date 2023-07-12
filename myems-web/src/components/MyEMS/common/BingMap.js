import React, { useState } from 'react';
import { BingMapProvider, MapContainer, Pushpin } from 'react-bingmaps';

function BingMapsExample() {
  const [pushpinCoords, setPushpinCoords] = useState({
    latitude: 47.6097,
    longitude: -122.3331
  });

  const handleMapClick = (mouseEvent) => {
    const { latitude, longitude } = mouseEvent.location;

    setPushpinCoords({
      latitude,
      longitude
    });
  };

  return (
    <BingMapProvider bingMapsKey="<YOUR_BING_MAPS_API_KEY>">
      <MapContainer
        center={[pushpinCoords.latitude, pushpinCoords.longitude]}
        onClick={handleMapClick}
      >
        <Pushpin location={[pushpinCoords.latitude, pushpinCoords.longitude]} />
      </MapContainer>
    </BingMapProvider>
  );
}

export default BingMapsExample;