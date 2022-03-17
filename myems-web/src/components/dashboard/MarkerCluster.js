import { useEffect } from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { useLeaflet } from 'react-leaflet';
import { customMarker } from './constants';

const mcg = L.markerClusterGroup({
  chunkedLoading: false,
  spiderfyOnMaxZoom: false
});

const MarkerCluster = ({ markers }) => {
  const { map } = useLeaflet();

  useEffect(() => {
    mcg.clearLayers();
    markers.map(({ lat, long, name, street, location }) => {
      const popupContent = `
        <h6 class="mb-1">${name}</h6>
        <p class="m-0 text-500">${street}, ${location}</p>
      `;
      return L.marker(new L.LatLng(lat, long), {
        icon: customMarker
      })
        .addTo(mcg)
        .bindPopup(popupContent);
    });

    // optionally center the map around the markers
    // map.fitBounds(mcg.getBounds());
    // // add the marker cluster group to the map
    map.addLayer(mcg);
  }, [markers, map]);

  return null;
};

MarkerCluster.propTypes = {
  markers: PropTypes.arrayOf(
    PropTypes.shape({
      lat: PropTypes.number.isRequired,
      long: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      street: PropTypes.string,
      location: PropTypes.string
    }).isRequired
  ).isRequired
};

export default MarkerCluster;
