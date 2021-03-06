/**
 * React Static Boilerplate
 * https://github.com/koistya/react-static-boilerplate
 * Copyright (c) Konstantin Tarkus (@koistya) | MIT license
 */

import 'babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';

import { History, Window, Document } from './lib/BrowserProxy';
import { scrollToElementSmoothly, scrollToSmoothly } from './lib/scrollSmoothly';

import Layout from './components/Layout';

const routes = {}; // Auto-generated on build. See tools/lib/routes-loader.js

const route = async (path, callback) => {
  if (path.endsWith('/')) {
    path = path.substr(0, path.lastIndexOf('/'));
  }

  if (path === '') {
    path = '/';
  }

  const handler = routes[path] || routes['/404'];
  const component = await handler();
  await callback(<Layout>{React.createElement(component)}</Layout>);
};

function run() {
  const container = Document.getElementById('app');
  const pageLoader = Document.getElementById('page-loader');
  History.listen(location => {
    route(location.pathname, async (component) => {
        ReactDOM.render(component, container, () => {
          pageLoader.style.display = 'none';
          if (location.hash.length > 1) {
            const hashName = location.hash.substr(1);
            const targetElem = Document.getElementsByName(hashName)[0];
            const headerElem
              = Document.getElementsByClassName('section-title')[0];
            const headerElemHeight =
              headerElem ? headerElem.getBoundingClientRect().height : 66;

            scrollToElementSmoothly.call(Window, targetElem, headerElemHeight);

          } else {
            scrollToSmoothly.call(Window, 0, 0);
          }
          // Track the page view event via Google Analytics
          Window.ga('send', 'pageview');
        });
    });
  });
}

Window.scrollToSmoothly = scrollToSmoothly.bind(Window);
Window.addEventListener('DOMContentLoaded', run);

export default { route, routes };
