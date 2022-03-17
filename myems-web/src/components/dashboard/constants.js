import L from 'leaflet';
import markIcon from '../../assets/img/leaflet-icon/marker-icon.png';

export const customMarker = new L.Icon({
  iconUrl: markIcon,
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40]
});
