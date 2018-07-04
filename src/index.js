import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import App from './App';
import GapiService from './services/GapiService';
import { gapiParams } from "./config/gapi";
// import './utils/koala-js-promisified/koala-js.testcases';
// import registerServiceWorker from './registerServiceWorker'; // -- enable client-side caching
import { unregister } from './registerServiceWorker'; // -- disable client-side caching
unregister(); // -- disable client-side caching

// initialize services
GapiService.init(gapiParams);

ReactDOM.render(<App gapi={GapiService} appStartUrl={getAppStartUrl()} appBaseUrlPath={getAppBasePathName()} gDriveState={getGDriveState()} />,
  document.getElementById('root'));
// registerServiceWorker(); -- enable client-side caching

function getAppStartUrl() {
  const wloc = window.location;
  return wloc.protocol + '//' + wloc.host + wloc.pathname;
}

function getAppBasePathName() {
  const pathname = window.location.pathname;
  // skip trailing /
  if (pathname.length && pathname[pathname.length - 1] === '/') {
    return pathname.substring(0, pathname.length - 1);
  } else {
    return pathname;
  }
}

function getGDriveState() {
  const state = new URLSearchParams(window.location.search).get('state');
  return !!state ? JSON.parse(state) : undefined;
}
