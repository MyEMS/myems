import React, { useState, useEffect, } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { settings } from '../../../config';
import { getItemFromStore } from '../../../helpers/utils';
import { withTranslation } from 'react-i18next';


const TestMap = ({t}) => {
    const [latitude, setLatitude] = useState(116.397428);
    const [longitude, setLongitude] = useState(39.90923);
    var map = {};
    
    // dom渲染成功后进行map对象的创建
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
      })
        .then(AMap => {
        map = new AMap.Map('container', {
            // 设置地图容器id
            viewMode: '3D', 
            zoom: 10, 
            center: [latitude, longitude], 
            lang: language
        });

        const marker = new AMap.Marker({
          position: new AMap.LngLat(116.397428, 39.90923),
      });
        map.add(marker)
        })
        .catch(e => {
        console.log(e);
        });
    }, [t, ]);

    return (
      // 初始化创建地图容器,div标签作为地图容器，同时为该div指定id属性；
    <>
    <div id="container" className="map" style={{ height: '100%', width: '100%' }} ></div>;
    </>
    )
};

export default withTranslation()(TestMap);