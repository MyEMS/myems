export default {
  Default: [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#ffffff' }, { lightness: 17 }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }, { lightness: 18 }]
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }, { lightness: 16 }]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }, { lightness: 21 }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#dedede' }, { lightness: 21 }]
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }]
    },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#f2f2f2' }, { lightness: 19 }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#fefefe' }, { lightness: 20 }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }]
    }
  ],
  Gray: [
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ saturation: 36 }, { color: '#000000' }, { lightness: 40 }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'on' }, { color: '#000000' }, { lightness: 16 }]
    },
    {
      featureType: 'all',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }, { lightness: 20 }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#000000' }, { lightness: 17 }, { weight: 1.2 }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 20 }]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 21 }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }, { lightness: 17 }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#000000' }, { lightness: 29 }, { weight: 0.2 }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 18 }]
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 16 }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 19 }]
    },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#000000' }, { lightness: 17 }] }
  ],
  Midnight: [
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#000000' }, { lightness: 13 }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#144b53' }, { lightness: 14 }, { weight: 1.4 }]
    },
    { featureType: 'landscape', elementType: 'all', stylers: [{ color: '#08304b' }] },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#0c4152' }, { lightness: 5 }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#0b434f' }, { lightness: 25 }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#0b3d51' }, { lightness: 16 }]
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }]
    },
    { featureType: 'transit', elementType: 'all', stylers: [{ color: '#146474' }] },
    {
      featureType: 'water',
      elementType: 'all',
      stylers: [{ color: '#021019' }]
    }
  ],
  Hopper: [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ hue: '#165c64' }, { saturation: 34 }, { lightness: -69 }, { visibility: 'on' }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ hue: '#b7caaa' }, { saturation: -14 }, { lightness: -18 }, { visibility: 'on' }]
    },
    {
      featureType: 'landscape.man_made',
      elementType: 'all',
      stylers: [{ hue: '#cbdac1' }, { saturation: -6 }, { lightness: -9 }, { visibility: 'on' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ hue: '#8d9b83' }, { saturation: -89 }, { lightness: -12 }, { visibility: 'on' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ hue: '#d4dad0' }, { saturation: -88 }, { lightness: 54 }, { visibility: 'simplified' }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ hue: '#bdc5b6' }, { saturation: -89 }, { lightness: -3 }, { visibility: 'simplified' }]
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ hue: '#bdc5b6' }, { saturation: -89 }, { lightness: -26 }, { visibility: 'on' }]
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ hue: '#c17118' }, { saturation: 61 }, { lightness: -45 }, { visibility: 'on' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'all',
      stylers: [{ hue: '#8ba975' }, { saturation: -46 }, { lightness: -28 }, { visibility: 'on' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ hue: '#a43218' }, { saturation: 74 }, { lightness: -51 }, { visibility: 'simplified' }]
    },
    {
      featureType: 'administrative.province',
      elementType: 'all',
      stylers: [{ hue: '#ffffff' }, { saturation: 0 }, { lightness: 100 }, { visibility: 'simplified' }]
    },
    {
      featureType: 'administrative.neighborhood',
      elementType: 'all',
      stylers: [{ hue: '#ffffff' }, { saturation: 0 }, { lightness: 100 }, { visibility: 'off' }]
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels',
      stylers: [{ hue: '#ffffff' }, { saturation: 0 }, { lightness: 100 }, { visibility: 'off' }]
    },
    {
      featureType: 'administrative.land_parcel',
      elementType: 'all',
      stylers: [{ hue: '#ffffff' }, { saturation: 0 }, { lightness: 100 }, { visibility: 'off' }]
    },
    {
      featureType: 'administrative',
      elementType: 'all',
      stylers: [{ hue: '#3a3935' }, { saturation: 5 }, { lightness: -57 }, { visibility: 'off' }]
    },
    {
      featureType: 'poi.medical',
      elementType: 'geometry',
      stylers: [{ hue: '#cba923' }, { saturation: 50 }, { lightness: -46 }, { visibility: 'on' }]
    }
  ],
  Beard: [
    {
      featureType: 'poi.business',
      elementType: 'labels.text',
      stylers: [{ visibility: 'on' }, { color: '#333333' }]
    }
  ],
  AssassianCreed: [
    {
      featureType: 'all',
      elementType: 'all',
      stylers: [{ visibility: 'on' }]
    },
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }, { saturation: '-100' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ saturation: 36 }, { color: '#000000' }, { lightness: 40 }, { visibility: 'off' }]
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'off' }, { color: '#000000' }, { lightness: 16 }]
    },
    {
      featureType: 'all',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }, { lightness: 20 }]
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#000000' }, { lightness: 17 }, { weight: 1.2 }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 20 }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry.fill',
      stylers: [{ color: '#4d6059' }]
    },
    {
      featureType: 'landscape',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#4d6059' }]
    },
    {
      featureType: 'landscape.natural',
      elementType: 'geometry.fill',
      stylers: [{ color: '#4d6059' }]
    },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ lightness: 21 }] },
    {
      featureType: 'poi',
      elementType: 'geometry.fill',
      stylers: [{ color: '#4d6059' }]
    },
    {
      featureType: 'poi',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#4d6059' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ visibility: 'on' }, { color: '#7f8d89' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.fill',
      stylers: [{ color: '#7f8d89' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#7f8d89' }, { lightness: 17 }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#7f8d89' }, { lightness: 29 }, { weight: 0.2 }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 18 }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry.fill',
      stylers: [{ color: '#7f8d89' }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#7f8d89' }]
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 16 }]
    },
    {
      featureType: 'road.local',
      elementType: 'geometry.fill',
      stylers: [{ color: '#7f8d89' }]
    },
    {
      featureType: 'road.local',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#7f8d89' }]
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 19 }]
    },
    {
      featureType: 'water',
      elementType: 'all',
      stylers: [{ color: '#2b3638' }, { visibility: 'on' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#2b3638' }, { lightness: 17 }]
    },
    {
      featureType: 'water',
      elementType: 'geometry.fill',
      stylers: [{ color: '#24282b' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#24282b' }]
    },
    { featureType: 'water', elementType: 'labels', stylers: [{ visibility: 'off' }] },
    {
      featureType: 'water',
      elementType: 'labels.text',
      stylers: [{ visibility: 'off ' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'off' }]
    },
    { featureType: 'water', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] }
  ],
  SubtleGray: [
    {
      featureType: 'administrative',
      elementType: 'all',
      stylers: [{ saturation: '-100' }]
    },
    {
      featureType: 'administrative.province',
      elementType: 'all',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'landscape',
      elementType: 'all',
      stylers: [{ saturation: -100 }, { lightness: 65 }, { visibility: 'on' }]
    },
    {
      featureType: 'poi',
      elementType: 'all',
      stylers: [{ saturation: -100 }, { lightness: '50' }, { visibility: 'simplified' }]
    },
    {
      featureType: 'road',
      elementType: 'all',
      stylers: [{ saturation: -100 }]
    },
    {
      featureType: 'road.highway',
      elementType: 'all',
      stylers: [{ visibility: 'simplified' }]
    },
    {
      featureType: 'road.arterial',
      elementType: 'all',
      stylers: [{ lightness: '30' }]
    },
    {
      featureType: 'road.local',
      elementType: 'all',
      stylers: [{ lightness: '40' }]
    },
    {
      featureType: 'transit',
      elementType: 'all',
      stylers: [{ saturation: -100 }, { visibility: 'simplified' }]
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ hue: '#ffff00' }, { lightness: -25 }, { saturation: -97 }]
    },
    { featureType: 'water', elementType: 'labels', stylers: [{ lightness: -25 }, { saturation: -100 }] }
  ],
  Tripitty: [
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'administrative',
      elementType: 'all',
      stylers: [{ visibility: 'off' }]
    },
    { featureType: 'landscape', elementType: 'all', stylers: [{ color: '#2c5ca5' }] },
    {
      featureType: 'poi',
      elementType: 'all',
      stylers: [{ color: '#2c5ca5' }]
    },
    { featureType: 'road', elementType: 'all', stylers: [{ visibility: 'off' }] },
    {
      featureType: 'transit',
      elementType: 'all',
      stylers: [{ visibility: 'off' }]
    },
    { featureType: 'water', elementType: 'all', stylers: [{ color: '#193a70' }, { visibility: 'on' }] }
  ]
};
