import React, { useState, useEffect, useRef, useContext} from 'react';
import { withTranslation } from 'react-i18next';
import { settings } from '../../../config';
import { getItemFromStore } from '../../../helpers/utils';
import AppContext from '../../../context/Context';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import 'mapbox-gl/dist/mapbox-gl.css';

const CustomizeMapBox = ({Latitude, Longitude, Zoom,t}) => {
    mapboxgl.accessToken = 'pk.eyJ1IjoibXllbXMiLCJhIjoiY2xtaW12Z2QyMHpvNzNmcGdta2lmMjBueiJ9.BL2jGoEnetv-9JZR9eTYNQ';
    
    var lang = getItemFromStore('myems_web_ui_language', settings.language);
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const [zoom, setZoom] = useState(9);
    const { isDark } = useContext(AppContext);
  
    useEffect(() => {
      if (map.current) return; // initialize map only once
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        zoom: Zoom ? Zoom : zoom,
        center: [Latitude ? Latitude : lng, Longitude ? Longitude : lat],
        style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12',
      });
  
      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });
    }, [t, Latitude, Longitude, zoom]);
  
    return (
      <div style={{width:'100%', height: '100%'}}>
        <div style={{width:'100%', height: '100%'}} ref={mapContainer} className="map-container" />
      </div>
    );
};

export default withTranslation()(CustomizeMapBox);