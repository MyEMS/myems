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
  // 降级渲染：即使 i18n 初始化失败，也尝试渲染应用
  ReactDOM.render(
    <Main>
      <App />
    </Main>,
    document.getElementById('main')
  );
});
