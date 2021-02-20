import React, { Fragment } from 'react';
import PageHeader from '../common/PageHeader';
import { Button, Card, CardBody, CardHeader } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import 'leaflet/dist/leaflet.css';
import { Map } from 'react-leaflet';
import MarkerCluster from '../dashboard/MarkerCluster';
import 'leaflet.tilelayer.colorfilter';
import L from 'leaflet';
import { useContext } from 'react';
import AppContext from '../../context/Context';
import FalconEditor from '../common/FalconEditor';
import { useRef } from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

const leafletCode = `function LeafletMap  () {
  const { isDark } = useContext(AppContext);
  
  const markers = [
    {
      lat: 53.958332,
      long: -1.080278,
      name: 'Diana Meyer',
      street: 'Slude Strand 27',
      location: '1130 Kobenhavn'
    },
    {
      lat: 52.958332,
      long: -1.080278,
      name: 'Diana Meyer',
      street: 'Slude Strand 27',
      location: '1130 Kobenhavn'
    },
    {
      lat: 51.958332,
      long: -1.080278,
      name: 'Diana Meyer',
      street: 'Slude Strand 27',
      location: '1130 Kobenhavn'
    },]
  const filter = isDark
    ? ['invert:98%', 'grayscale:69%', 'bright:89%', 'contrast:111%', 'hue:205deg', 'saturate:1000%']
    : ['bright:101%', 'contrast:101%', 'hue:23deg', 'saturate:225%'];


  if(mapWidht){
    useEffect(() => {
      L.tileLayer
        .colorFilter('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: null,
          transparent: true,
          filter: filter
        })
        .addTo(map.current.leafletElement);
    }, [filter]);
    return (
      <Map
        center={[10.737, 0]}
        zoom={1}
        minZoom={1}
        maxZoom={18}
        zoomSnap={0.5}
        className="h-100 w-100"
        style={{ width:mapWidht, minHeight: 300 }}
        ref={map}
      >
        <MarkerCluster markers={markers} />
      </Map>
    );
  }
  return null;
};`;
const Leaflet = () => {
  const { isDark } = useContext(AppContext);
  let map = useRef(null);
  const [mapWidht, setMapwidth] = useState();

  const egMap = useRef();
  useEffect(() => {
    const timer = setTimeout(() => {
      setMapwidth(egMap.current.offsetWidth);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, [isDark, mapWidht]);

  return (
    <Fragment>
      <PageHeader
        title="React Leaflet"
        description="We uses <code> react-Leaflet </code> that provides an abstraction of <strong>Leaflet</strong> as <strong>React components</strong>. For the beautiful animated marker Clustering functionality for leaflet map we use <a href='https://www.npmjs.com/package/leaflet.markercluster' target='_blank' >Leaflet.markercluster</a> and we apply CSS color filter on map tiles by <a href='https://github.com/xtk93x/Leaflet.TileLayer.ColorFilter' target='_blank' >Leaflet.TileLayer.ColorFilter</a> .  It has all the mapping features most developers ever need "
        className="mb-3"
      >
        <Button tag="a" href="https://react-leaflet.js.org/" target="_blank" color="link" size="sm" className="pl-0">
          React Leaflet Documentation
          <FontAwesomeIcon icon="chevron-right" className="ml-1 fs--2" />
        </Button>
      </PageHeader>
      <Card innerRef={egMap}>
        <CardHeader className="bg-light">
          <h4 className="mb-0">Example</h4>
        </CardHeader>

        <CardBody className="p-0">
          <FalconEditor
            code={leafletCode}
            scope={{ AppContext, MarkerCluster, Map, map, mapWidht, L }}
            language="jsx"
          />
        </CardBody>
      </Card>
    </Fragment>
  );
};

export default Leaflet;
