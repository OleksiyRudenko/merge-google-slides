import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
import App from './App';
import GapiService from './services/GapiService';
import SourceDecksService from './services/SourceDecksService';
import { gapiParams } from "./config/gapi";
import { gapiDevParams } from "./config/gapi.dev.js";
import GSlidesService from "./services/GSlidesService";
// import './utils/koala-js-promisified/koala-js.testcases';
// import registerServiceWorker from './registerServiceWorker'; // -- enable client-side caching
import { unregister } from './registerServiceWorker'; // -- disable client-side caching
unregister(); // -- disable client-side caching

let gapiAuthParams = gapiParams;

if (process.env.NODE_ENV === 'development') {
  gapiAuthParams = Object.assign(gapiParams, gapiDevParams);
}

GSlidesService.init(SourceDecksService);

const gDriveState = getGDriveState();
if (gDriveState && gDriveState.userId) {
  gapiAuthParams.login_hint = gDriveState.userId;
}

// initialize services
GapiService.init(gapiAuthParams);

ReactDOM.render(<App
    gapi={GapiService}
    appStartUrl={getAppStartUrl()}
    appBaseUrlPath={getAppBasePathName()}
    appUrlSearchParams={getUrlSearchParams()}
    gDriveState={getGDriveState()} />,
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

function getUrlSearchParams() {
  let params = {};
  const search = new URLSearchParams(window.location.search);
  for (let p of search) {
    params[p[0]] = p[1];
  }
  return params;
}
