import 'react-app-polyfill/ie9';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Main from './Main';
import './helpers/initFA';
import { i18nInitPromise } from './i18n';

i18nInitPromise.then(() => {
  ReactDOM.render(
    <Main>
      <App />
    </Main>,
    document.getElementById('main')
  );
}).catch(err => {
  console.error('i18n init failed:', err);
  const root = document.getElementById('main');
  root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:system-ui,sans-serif;color:#333;text-align:center;"><div><h1 style="font-size:48px;color:#e74c3c;">500</h1><p style="font-size:18px;margin-top:16px;">Language loading failed. Please refresh the page or contact support.</p></div></div>';
});
