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
});
