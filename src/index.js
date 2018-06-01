import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import _GapiService from './services/GapiService';
import {gapiParams} from "./config/gapi";
import registerServiceWorker from './registerServiceWorker';

// instantiate services
const GapiService = new _GapiService(gapiParams);

ReactDOM.render(<App gapi={GapiService} />, document.getElementById('root'));
registerServiceWorker();
