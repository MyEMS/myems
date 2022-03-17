import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Main from './Main';
import './helpers/initFA';
import './i18n';

ReactDOM.render(
  <Main>
    <App />
  </Main>,
  document.getElementById('main')
);
