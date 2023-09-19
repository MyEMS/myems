import React, { useState, useEffect, useRef, useContext, useCallback} from 'react';
import { withTranslation } from 'react-i18next';
import { settings } from '../../../config';
import { getItemFromStore } from '../../../helpers/utils';
import AppContext from '../../../context/Context';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibXllbXMiLCJhIjoiY2xtaW12Z2QyMHpvNzNmcGdta2lmMjBueiJ9.BL2jGoEnetv-9JZR9eTYNQ';
if (mapboxgl.getRTLTextPluginStatus !== 'loaded') {
  mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js');
}

const CustomizeMapBox = ({Latitude, Longitude, Zoom,t}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const [zoom, setZoom] = useState(9);
    const { isDark, language } = useContext(AppContext);
    
    useEffect(() => {
      var lang = language;
      if (lang === 'zh_CN') {
        lang = 'zh-Hans';
      } 

      if (map.current) return; // initialize map only once
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        zoom: Zoom ? Zoom : zoom,
        center: [Latitude ? Latitude : lng, Longitude ? Longitude : lat],
        style: isDark ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11',
      });

      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });

      const mapboxLanguage = new MapboxLanguage({
        defaultLanguage: lang
      });
      
      map.current.addControl(mapboxLanguage);

    }, [t, Latitude, Longitude, Zoom]);

    useEffect(() => {
      var lang = language;
      if (lang === 'zh_CN') {
        lang = 'zh-Hans';
      } 

      if (map.current) map.current.remove(); // initialize map only once
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        zoom: Zoom ? Zoom : zoom,
        center: [Latitude ? Latitude : lng, Longitude ? Longitude : lat],
        style: isDark ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11',
      });

      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });
      console.log(lang);

      const mapboxLanguage = new MapboxLanguage({
        defaultLanguage: lang
      });
      
      map.current.addControl(mapboxLanguage);
    }, [language])

    return (
      <div id="container" className="map" style={{width:'100%', height: '100%'}} ref={mapContainer} />
    );
};

export default withTranslation()(CustomizeMapBox);