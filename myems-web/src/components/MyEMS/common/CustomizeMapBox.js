import React, { useState, useEffect, useRef, useContext } from 'react';
import { withTranslation } from 'react-i18next';
import AppContext from '../../../context/Context';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';
import {checkEmpty, getCookieValue} from "../../../helpers/utils";
import { settings } from '../../../config';

mapboxgl.accessToken = settings.mapboxToken;
if (mapboxgl.getRTLTextPluginStatus !== 'loaded') {
  mapboxgl.setRTLTextPlugin('https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js');
}

const CustomizeMapBox = ({Latitude, Longitude, Zoom, Geojson, t}) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [lng, setLng] = useState(-77.032);
    const [lat, setLat] = useState(38.913);
    const [zoom, setZoom] = useState(9);
    const { isDark, language } = useContext(AppContext);

    useEffect(() => {
      let is_logged_in = getCookieValue('is_logged_in');
      if (checkEmpty(is_logged_in) || !is_logged_in) {
        return;
      }
      var lang = language;
      if (lang === 'zh_CN') {
        lang = 'zh-Hans';
      }

      if (map.current) return; // initialize map only once
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        zoom: Zoom ? Zoom : zoom,
        center: [Longitude ? Longitude : lng, Latitude ? Latitude : lat],
        style: isDark ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11',
      });

      map.current.on('move', () => {
        setZoom(map.current.getZoom().toFixed(2));
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
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
      if (!map.current) return;
      if (Geojson !== null && Geojson !== undefined) {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          zoom: Zoom ? Zoom : zoom,
          center: [Longitude ? Longitude : lng, Latitude ? Latitude : lat],
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

        map.current.on('load', () => {
          map.current.addSource('earthquakes', {
            type: 'geojson',
            data: {
              'type': 'FeatureCollection',
              'features': Geojson
              },
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
          });

          map.current.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'earthquakes',
          filter: ['has', 'point_count'],
          paint: {
          // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
          // with three steps to implement three types of circles:
          //   * Blue, 20px circles when point count is less than 2
          //   * Yellow, 30px circles when point count is between 2 and 15
          //   * Pink, 40px circles when point count is greater than or equal to 15
          'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          2,
          '#f1f075',
          15,
          '#f28cb1'
          ],
          'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          1,
          30,
          15,
          40
          ]
          }
          });

          map.current.addLayer({
          id: 'cluster-count',
            type: 'symbol',
            source: 'earthquakes',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': ['get', 'point_count_abbreviated'],
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
              }
          });

          map.current.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'earthquakes',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': '#11b4da',
            'circle-radius': 10,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
          }
          });

          // inspect a cluster on click
          map.current.on('click', 'clusters', (e) => {
            const features = map.current.queryRenderedFeatures(e.point, {
            layers: ['clusters']
          });
          const clusterId = features[0].properties.cluster_id;
          map.current.getSource('earthquakes').getClusterExpansionZoom(
            clusterId,
              (err, zoom) => {
              if (err) return;
              map.current.easeTo({
                  zoom: zoom,
                  center: features[0].geometry.coordinates
                });
              }
            );
          });

          map.current.on('click', 'unclustered-point', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const url = e.features[0].properties.url;
            const uuid = e.features[0].properties.uuid;
            const title = e.features[0].properties.title;
            const description = e.features[0].properties.description;

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            new mapboxgl.Popup() // add popups
            .setLngLat(coordinates)
            .setHTML(
              `<a target="_blank" href="${url}?uuid=${uuid}">
                <div class="d-flex align-items-center media">
                  <div class="ml-2 media-body">
                    <h3 class="mb-0 fs--1">${title}</h3>
                  </div>
                </div>
              </a>
              <p>${description}</p>`
            )
            .addTo(map.current);
          });
        });
      }
    }, [language, Geojson])

    return (
      <div id="container" className="map" style={{width:'100%', height: '100%'}} ref={mapContainer} />
    );
};

export default withTranslation()(CustomizeMapBox);