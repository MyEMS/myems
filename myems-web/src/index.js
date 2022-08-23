import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Main from './Main';
import './helpers/initFA';
import './i18n';
import {  Chart as ChartJS } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
ChartJS.register(annotationPlugin);

ReactDOM.render(
  <Main>
    <App />
  </Main>,
  document.getElementById('main')
);
