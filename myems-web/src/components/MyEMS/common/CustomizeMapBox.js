import React, { useState, useEffect, useRef, useContext } from 'react';
import { withTranslation } from 'react-i18next';
import AppContext from '../../../context/Context';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';
import { checkEmpty, getCookieValue } from '../../../helpers/utils';
import { settings } from '../../../config';
import map_maker from '../../../assets/img/icons/map-marker.png';

mapboxgl.accessToken = settings.mapboxToken;
mapboxgl.config = { MAX_PARALLEL_IMAGE_REQUESTS: 64 };
if (mapboxgl.getRTLTextPluginStatus !== 'loaded') {
  mapboxgl.setRTLTextPlugin(
      'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js'
  );
}

const CustomizeMapBox = ({ Latitude, Longitude, Zoom, Geojson, t }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-77.032);
  const [lat, setLat] = useState(38.913);
  const [zoom, setZoom] = useState(9);
  const { isDark, language } = useContext(AppContext);

  const lastProcessedGeojsonRef = useRef(null);


  useEffect(() => {
    let is_logged_in = getCookieValue('is_logged_in');
    if (checkEmpty(is_logged_in) || !is_logged_in) {
      return;
    }


    if (map.current) {
      if (Longitude && Latitude) {
        const currentCenter = map.current.getCenter();
        const newCenter = [Longitude, Latitude];
        if (
            Math.abs(currentCenter.lng - newCenter[0]) > 0.0001 ||
            Math.abs(currentCenter.lat - newCenter[1]) > 0.0001
        ) {
          map.current.setCenter(newCenter);
        }
      }
      if (Zoom) {
        const currentZoom = map.current.getZoom();
        if (Math.abs(currentZoom - Zoom) > 0.01) {
          map.current.setZoom(Zoom);
        }
      }
      return;
    }

    var lang = language;
    if (lang === 'zh_CN') {
      lang = 'zh-Hans';
    } else if (lang === 'zh_TW') {
      lang = 'zh-Hant';
    }

    const initialZoom = Zoom || 9;
    const initialLng = Longitude || -77.032;
    const initialLat = Latitude || 38.913;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      zoom: initialZoom,
      center: [initialLng, initialLat],
      style: isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/streets-v12',
      scrollZoom: true,
      boxZoom: true,
      dragRotate: true,
      dragPan: true,
      keyboard: true,
      doubleClickZoom: true,
      touchZoomRotate: true,
      trackResize: true,
      attributionControl: true
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


    if (Geojson && Geojson.length > 0) {
      map.current.once('load', () => {
        addGeojsonDataToMap(Geojson);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [Latitude, Longitude, Zoom, isDark, language]);


  const addGeojsonDataToMap = (geojsonData) => {
    if (!map.current) {
      console.warn('Map not initialized');
      return;
    }

    if (!geojsonData || geojsonData.length === 0) {
      console.warn('No Geojson data to add');
      return;
    }


    if (!map.current.isStyleLoaded()) {
      map.current.once('style.load', () => {
        addGeojsonDataToMap(geojsonData);
      });
      return;
    }


    const addSourceAndLayers = () => {
      if (!map.current) return;
       try {
        if (map.current.getLayer('store-labels')) {
          map.current.removeLayer('store-labels');
        }
        if (map.current.getLayer('unclustered-point')) {
          map.current.removeLayer('unclustered-point');
        }
        if (map.current.getLayer('cluster-count')) {
          map.current.removeLayer('cluster-count');
        }
        if (map.current.getLayer('clusters')) {
          map.current.removeLayer('clusters');
        }
        if (map.current.getSource('myems')) {
          map.current.removeSource('myems');
        }
      } catch (error) {
        console.warn('Error removing old layers/source:', error);
      }


      map.current.addSource('myems', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: geojsonData
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      });


      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'myems',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 2, '#f1f075', 15, '#f28cb1'],
          'circle-radius': ['step', ['get', 'point_count'], 20, 1, 30, 15, 40]
        }
      });


      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'myems',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12
        }
      });


      map.current.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'myems',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': 'map-marker',
          'icon-size': 0.5
        }
      });


      map.current.addLayer({
        id: 'store-labels',
        type: 'symbol',
        source: 'myems',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'text-field': ['get', 'title'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
          'text-offset': [0, 1.5],
          'text-anchor': 'top'
        },
        paint: {
          'text-color': '#333333',
          'text-halo-color': '#ffffff',
          'text-halo-width': 2
        }
      });


      map.current.off('click', 'clusters');
      map.current.off('click', 'unclustered-point');


      map.current.on('click', 'clusters', e => {
        const features = map.current.queryRenderedFeatures(e.point, {
          layers: ['clusters']
        });
        if (features.length > 0) {
          const clusterId = features[0].properties.cluster_id;
          map.current.getSource('myems').getClusterExpansionZoom(clusterId, (err, zoom) => {
            if (err) return;
            map.current.easeTo({
              zoom: zoom,
              center: features[0].geometry.coordinates
            });
          });
        }
      });


      map.current.on('click', 'unclustered-point', e => {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const url = e.features[0].properties.url;
        const uuid = e.features[0].properties.uuid;
        const title = e.features[0].properties.title;
        const description = e.features[0].properties.description;

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                `
              <h3 style="font: 400 15px/22px 'Source Sans Pro', 'Helvetica Neue', sans-serif;
                  background: #91c949;
                  color: #fff;
                  margin: 0;
                  padding: 10px;
                  border-radius: 3px 3px 0 0;
                  font-weight: 700;"><a target="_blank" href="${url}?uuid=${uuid}">${title}</a>
              </h3>
            <h4 style="font: 400 15px/22px 'Source Sans Pro', 'Helvetica Neue', sans-serif;
                background: #91c949;
                color: #fff;
                margin: 0;
                padding: 10px;
                font-weight: 400;">${description}</h4>`
            )
            .addTo(map.current);
      });
    };


    if (!map.current.hasImage('map-marker')) {
      map.current.loadImage(map_maker, (error, image) => {
        if (error) {
          console.error('Error loading map marker image:', error);
          return;
        }
        if (map.current && !map.current.hasImage('map-marker')) {
          map.current.addImage('map-marker', image);
        }
        addSourceAndLayers();
      });
    } else {
      addSourceAndLayers();
    }
  };


  useEffect(() => {

    if (!Geojson || Geojson.length === 0 || !map.current) {
      return;
    }


    const geojsonString = JSON.stringify(Geojson);
    if (lastProcessedGeojsonRef.current === geojsonString) {

      return;
    }
    lastProcessedGeojsonRef.current = geojsonString;


    const timer = setTimeout(() => {
      if (map.current) {
        addGeojsonDataToMap(Geojson);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [Geojson]);


  useEffect(() => {
    if (!map.current || !Geojson || Geojson.length === 0) {
      return;
    }

    const handleMapLoad = () => {
      // 检查是否已有 source，如果没有则添加
      if (map.current && !map.current.getSource('myems')) {
        addGeojsonDataToMap(Geojson);
      }
    };

    if (map.current.isStyleLoaded()) {
      handleMapLoad();
    } else {
      map.current.once('load', handleMapLoad);
    }
  }, []);

  return <div id="container" className="map" style={{ width: '100%', height: '100%' }} ref={mapContainer} />;
};

export default withTranslation()(CustomizeMapBox);