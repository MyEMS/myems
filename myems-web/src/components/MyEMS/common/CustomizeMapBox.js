import React, { useState, useEffect, useRef, useContext, useCallback} from 'react';
import { withTranslation } from 'react-i18next';
import Flex from '../../common/Flex';
import {
  Media
} from 'reactstrap';
import { Link } from 'react-router-dom';
import AppContext from '../../../context/Context';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibXllbXMiLCJhIjoiY2xtaW12Z2QyMHpvNzNmcGdta2lmMjBueiJ9.BL2jGoEnetv-9JZR9eTYNQ';
if (mapboxgl.getRTLTextPluginStatus !== 'loaded') {
  mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js');
}

const geojson = {
  'type': 'FeatureCollection',
  'features': [
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [-77.032, 38.913]
          },
        'properties': {
          'title': 'Mapbox',
          'description': 'Washington, D.C.',
          'uuid': 'f92c1673-b865-4e9c-ba20-6269b1196f64',
          'url': '/equipment/energycategory'
          }
      },
      {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [-122.414, 37.776]
          },
        'properties': {
          'title': 'Mapbox',
          'description': 'San Francisco, California',
          'uuid': '891f5275-186a-4a3c-8732-caf67b3884a5',
          'url': '/equipment/energycategory'
          }
      }
    ]
  };

const CustomizeMapBox = ({Latitude, Longitude, Zoom,t}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-77.032);
    const [lat, setLat] = useState(38.913);
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

      for (const feature of geojson.features) {
          // make a marker for each feature and add it to the map
          new mapboxgl.Marker()
          .setLngLat(feature.geometry.coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
            .setHTML(
              `<a target="_blank" href="${feature.properties.url}?uuid=${feature.properties.uuid}">
                <div class="d-flex align-items-center media">
                  <div class="ml-2 media-body">
                    <h3 class="mb-0 fs--1">${feature.properties.title}</h3>
                  </div>
                </div>
              </a>
              <p>${feature.properties.description}</p>`
            )
          )
        .addTo(map.current);
      }

      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });

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