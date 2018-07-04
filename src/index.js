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


ReactDOM.render(<App gapi={GapiService} baseUrlPath={window.location.hostname === 'localhost' ? '' : '/merge-google-slides'} />,
  document.getElementById('root'));
// registerServiceWorker(); -- enable client-side caching
