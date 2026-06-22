import React, { useState, useEffect, useRef, useContext } from 'react';
import { withTranslation } from 'react-i18next';
import AppContext from '../../../context/Context';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import 'mapbox-gl/dist/mapbox-gl.css';
import { checkEmpty, getCookieValue } from '../../../helpers/utils';
import { settings } from '../../../config';
import map_maker from '../../../assets/img/icons/map-marker.png';
import DOMPurify from 'dompurify';

if (settings.mapboxToken && 
    !settings.mapboxToken.includes('GET-YOUR-TOKEN') && 
    settings.mapboxToken.trim() !== '') {
  mapboxgl.accessToken = settings.mapboxToken;
  if (mapboxgl.getRTLTextPluginStatus !== 'loaded') {
    mapboxgl.setRTLTextPlugin(
        'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js'
    );
  }
} else {
  console.warn('⚠️ Mapbox Token is invalid or not configured. Map functionality will be unavailable.');
}

const isValidCoordinate = (value) => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

const CustomizeMapBox = ({ Latitude, Longitude, Zoom, Geojson, t }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-77.032);
  const [lat, setLat] = useState(38.913);
  const [zoom, setZoom] = useState(9);
  const { isDark, language } = useContext(AppContext);

  const lastProcessedGeojsonRef = useRef(null);
  const isMapReadyRef = useRef(false);

  const addGeojsonDataToMap = (geojsonData) => {
    if (!map.current) {
      return;
    }

    if (!geojsonData || !Array.isArray(geojsonData) || geojsonData.length === 0) {
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
        if (map.current.getSource('myems')) {
          const layers = ['clusters', 'cluster-count', 'unclustered-point'];
          layers.forEach(layerId => {
            if (map.current.getLayer(layerId)) {
              map.current.removeLayer(layerId);
            }
          });
          map.current.removeSource('myems');
        }
      } catch (error) {
        console.warn('Error removing old layers/source:', error);
      }

      const features = geojsonData.map(feature => {
        let coordinates = [116.397, 39.908];
        
        if (feature.geometry && 
            feature.geometry.coordinates && 
            Array.isArray(feature.geometry.coordinates) && 
            feature.geometry.coordinates.length >= 2) {
          const lng = parseFloat(feature.geometry.coordinates[0]);
          const lat = parseFloat(feature.geometry.coordinates[1]);
          
          if (isValidCoordinate(lng) && isValidCoordinate(lat)) {
            coordinates = [lng, lat];
          } else {
            console.warn('⚠️ GeoJSON contains invalid coordinates, using default coordinates', feature);
          }
        }
        
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: coordinates
          },
          properties: feature.properties || {
            title: 'Unknown Space',
            description: '',
            uuid: '',
            url: '/space/energycategory'
          }
        };
      });

      try {
        map.current.addSource('myems', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: features
          },
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50
        });
      } catch (error) {

        return;
      }

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

      // 移除旧的事件监听
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
        if (!e.features || e.features.length === 0) return;

        const coordinates = e.features[0].geometry.coordinates.slice();
        const url = e.features[0].properties.url || '/space/energycategory';
        const uuid = e.features[0].properties.uuid || '';
        const title = e.features[0].properties.title || 'Unnamed Space';
        const description = e.features[0].properties.description || '';

        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        const safeTitle = DOMPurify.sanitize(title);
        const safeDescription = DOMPurify.sanitize(description);
        const safeUrl = DOMPurify.sanitize(url);
        const safeUuid = DOMPurify.sanitize(uuid);

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(
                `
              <div style="min-width: 200px; max-width: 300px;">
                <h3 style="font: 600 16px/22px 'Source Sans Pro', 'Helvetica Neue', sans-serif;
                    background: #91c949;
                    color: #fff;
                    margin: 0;
                    padding: 10px;
                    border-radius: 3px 3px 0 0;">
                  <a target="_blank" href="${safeUrl}?uuid=${safeUuid}" style="color: #fff; text-decoration: none;">
                    ${safeTitle}
                  </a>
                </h3>
                ${safeDescription ? `
                  <h4 style="font: 400 14px/20px 'Source Sans Pro', 'Helvetica Neue', sans-serif;
                      background: #f5f5f5;
                      color: #333;
                      margin: 0;
                      padding: 10px;
                      border-radius: 0 0 3px 3px;
                      font-weight: 400;">
                    ${safeDescription}
                  </h4>
                ` : ''}
              </div>`
            )
            .addTo(map.current);
      });


      map.current.on('mouseenter', 'clusters', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'clusters', () => {
        map.current.getCanvas().style.cursor = '';
      });
      map.current.on('mouseenter', 'unclustered-point', () => {
        map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'unclustered-point', () => {
        map.current.getCanvas().style.cursor = '';
      });

      isMapReadyRef.current = true;
    };

    if (!map.current.hasImage('map-marker')) {
      map.current.loadImage(map_maker, (error, image) => {
        if (error) {

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
    let is_logged_in = getCookieValue('is_logged_in');
    if (checkEmpty(is_logged_in) || !is_logged_in) {
      return;
    }

    if (map.current) {

      if (isValidCoordinate(Longitude) && isValidCoordinate(Latitude)) {
        const currentCenter = map.current.getCenter();
        const newCenter = [Longitude, Latitude];
        if (
            Math.abs(currentCenter.lng - newCenter[0]) > 0.0001 ||
            Math.abs(currentCenter.lat - newCenter[1]) > 0.0001
        ) {
          map.current.setCenter(newCenter);
        }
      }
      if (Zoom && !isNaN(Zoom)) {
        const currentZoom = map.current.getZoom();
        if (Math.abs(currentZoom - Zoom) > 0.01) {
          map.current.setZoom(Zoom);
        }
      }


      if (map.current.isStyleLoaded() && Geojson && Geojson.length > 0) {
        const geojsonString = JSON.stringify(Geojson);
        if (lastProcessedGeojsonRef.current !== geojsonString) {
          lastProcessedGeojsonRef.current = geojsonString;
          addGeojsonDataToMap(Geojson);
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


    const initialZoom = isValidCoordinate(Zoom) ? Zoom : 9;
    const initialLng = isValidCoordinate(Longitude) ? Longitude : 116.397;
    const initialLat = isValidCoordinate(Latitude) ? Latitude : 39.908;

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
      touchZoomRotate: true
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


    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');


    if (Geojson && Geojson.length > 0) {
      map.current.once('load', () => {
        addGeojsonDataToMap(Geojson);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        isMapReadyRef.current = false;
      }
    };
  }, [Latitude, Longitude, Zoom, isDark, language]);


  useEffect(() => {
    if (!Geojson || !Array.isArray(Geojson) || Geojson.length === 0 || !map.current) {
      return;
    }


    const geojsonString = JSON.stringify(Geojson);
    if (lastProcessedGeojsonRef.current === geojsonString) {
      return;
    }
    lastProcessedGeojsonRef.current = geojsonString;


    const timer = setTimeout(() => {
      if (map.current && map.current.isStyleLoaded()) {
        addGeojsonDataToMap(Geojson);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [Geojson]);


  useEffect(() => {
    if (!map.current || !Geojson || !Array.isArray(Geojson) || Geojson.length === 0) {
      return;
    }

    const handleMapLoad = () => {
      if (map.current && map.current.isStyleLoaded()) {
        const geojsonString = JSON.stringify(Geojson);
        if (lastProcessedGeojsonRef.current !== geojsonString) {
          lastProcessedGeojsonRef.current = geojsonString;
          addGeojsonDataToMap(Geojson);
        }
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