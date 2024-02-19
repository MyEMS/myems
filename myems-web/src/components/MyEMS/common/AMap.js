import React, { useState, useEffect, useContext} from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { settings } from '../../../config';
import { getItemFromStore } from '../../../helpers/utils';
import { withTranslation } from 'react-i18next';
import AppContext from '../../../context/Context';

const CustomizeMap = ({Latitude, Longitude, Zoom,t}) => {
    const [latitude, setLatitude] = useState(116.397428);
    const [longitude, setLongitude] = useState(39.90923);
    const [zoom, setZoom] = useState(10);
    const { isDark } = useContext(AppContext);
    var map = {};
    // After successful DOM rendering, create the map object.
    useEffect(() => {
      var lang = getItemFromStore('myems_web_ui_language', settings.language);
      var language = 'zh_cn';
      if (lang !== 'zh_CN') {
        language = 'en';
      }
        AMapLoader.load({
            key: 'ff0f6de58a5165ac9d64701fad788114',
            version: '1.4.15',
            plugins: ['AMap.ToolBar','AMap.Geolocation', 'AMap.ElasticMarker', 'AMap.Scale'],
            AMapUI:{
                version:"1.1",
                plugins:[],
            },
            Loca:{
                version:"1.4.15"
            },
      }).then(AMap => {
        map = new AMap.Map('container', {
            // Set map container id.
            viewMode: '3D',
            zoom: Zoom ? Zoom : zoom,
            center: [Latitude ? Latitude : latitude, Longitude ? Longitude : longitude],
            lang: language,
        });
        if (isDark){
          map.setMapStyle('amap://styles/grey');
        } else {
          map.setMapStyle('amap://styles/light');
        }
        const marker = new AMap.Marker({
          position: new AMap.LngLat(Latitude ? Latitude : latitude, Longitude ? Longitude : longitude),
        });
        map.add(marker)
        })
      .catch(e => {
        console.log(e);
      });
    }, [t, Latitude, Longitude, zoom]);

    return (
      // Initialize map container, use div tag as the map container, and assign an id attribute to the div
    <>
    <div id="container" className="map" style={{ height: '100%', width: '100%' }} ></div>;
    </>
    )
};

export default withTranslation()(CustomizeMap);