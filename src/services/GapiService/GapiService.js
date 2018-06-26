// To import the self-initiated service: import {ServiceName} from "./services/ServiceName";
// To import service class: import ServiceClassName from "./services/ServiceName";
// Inspired by:
// https://developers.google.com/drive/api/v3/quickstart/js
// https://github.com/BespokeView/Load-Google-API/blob/master/src/index.js
// https://developers.google.com/identity/protocols/OAuth2UserAgent
// https://github.com/google/google-api-javascript-client/issues/319 -- se React

import {bindHandlers} from '../../utils/bind.js';

class _GapiService {
  constructor(gapiParams=null) {
    if (!!gapiParams) {
      this.gapiParams = this._normalizeClientInitParams(gapiParams);
    }
    this.state = {
      isClientLoaded: false,
      isSignedIn: false,
      isSignInRequired: false,
    };
    this.stateHandler = null;
    bindHandlers(this, '_handleClientLoad', '_initClient', '_updateSigninStatus', 'setStateHandler', 'handleAuthClick', 'handleSignoutClick', 'setState');
  }

  /**
   * Initializes gapi service with parameters
   * @param gapiParams
   */
  init(gapiParams) {
    this.gapiParams = this._normalizeClientInitParams(gapiParams);
    // load script
    const gapiScriptTag = document.createElement('script');
    const self = this;
    gapiScriptTag.onload = function() {
      this.onload=function(){};
      self._handleClientLoad();
    };
    gapiScriptTag.onreadystatechange = function() {
      if (this.readyState === 'complete') this.onload();
    };
    gapiScriptTag.src = "https://apis.google.com/js/api.js";
    document.body.appendChild(gapiScriptTag);
  }

  /**
   * Sets gapi state handling callback. Called every time when gapi state gets changed
   * @param stateHandler
   */
  setStateHandler(stateHandler) {
    this.stateHandler = stateHandler;
  }

  /**
   * On load, called to load the auth2 library and API client library.
   * @private
   */
  _handleClientLoad() {
    window.gapi.load('client:auth2', this._initClient);
  }

  /**
   * Initializes the API client library and sets up sign-in state
   * listeners.
   * @private
   */
  _initClient() {
    return window.gapi.client.init(this.gapiParams)
      .then(() => {
        this.setState({isClientLoaded: true}, 'GapiService._initClient().then(success)');

        // Listen for sign-in state changes.
        // window.gapi.auth2.getAuthInstance().isSignedIn.listen(this._updateSigninStatus);

        // Handle the initial sign-in state.
        this._updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get(), true, '_initClient().then(success)');
        return window.gapi.client;
      }, (error) => {
        console.log('GapiService._initClient() error', error);
        this.setState({
          isClientLoaded: true,
        }, 'GapiService._initClient().then((),error)');
        throw new Error(error);
      });
  }

  /**
   * Normalizes api initialization params
   * @param params
   * @returns {object}
   * @private
   */
  _normalizeClientInitParams(params) {
    return (typeof params.scope === 'string') ? params : Object.assign(params, {scope: params.scope.join(' ')});
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  _updateSigninStatus(isSignedIn, isInitialSignedInState = false, caller = 'unknown or window.gapi.auth2.getAuthInstance().isSignedIn.listen()') {
    console.log('GapiService._updateSigninStatus() called by ' + caller + ' with', isSignedIn, 'state = ', this.state);
    this.setState({
      isSignedIn : isSignedIn,
      isSignInRequired : !isSignedIn && isInitialSignedInState,
    }, 'GapiService._updateSignInStatus(caller = ' + caller + ')');
    /* if (isSignedIn) {
      this.listFiles();
    } */
  }

  /**
   *  Sign in the user upon button click.
   *  Use: button.onclick = handleAuthClick;
   */
  handleAuthClick(event) {
    window.gapi.auth2.getAuthInstance().signIn().then(() => {
      this.setState({
        isSignedIn: true,
        isSignInRequired: false,
      }, 'handleAuthClick')
    }, (error) => {
      console.log('GapiService.handleAuthClick() error', error);
      this.setState({
        isSignedIn: false,
        isSignInRequired: true,
      }, 'GapiService.handleAuthClick().then((),error)');
      throw new Error(error);
    });
  }

  /**
   *  Sign out the user upon button click.
   *  Use: button.onclick = handleSignoutClick;
   */
  handleSignoutClick(event) {
    window.gapi.auth2.getAuthInstance().signOut().then(() => {
      this.setState({
        isSignedIn: false,
        isSignInRequired: true,
      }, 'handleSignoutClick');
    }, (error) => {
      console.log('GapiService.handleSignoutClick() error', error);
      throw new Error(error);
    });
  }

  /**
   *
   */
  renderSignInButton() {

  }

  /**
   * Updates service state ReactJS-style
   * @param {Object} stateUpdate
   * @param {string} caller
   */
  setState(stateUpdate, caller='unknown') {
    console.log('GapiService.setState() called by ' + caller + ' to update', this.state, 'with', stateUpdate);
    this.state = Object.assign(this.state, stateUpdate);
    console.log('GapiService.setState() updated state', this.state);
    this.stateHandler && this.stateHandler(this.state);
  }

  /**
   * Print files.
   */
  /* listFiles() {
    window.gapi.client.drive.files.list({
      'pageSize': 10,
      'fields': "nextPageToken, files(id, name)"
    }).then(response => {
      console.log('GapiService.listFiles():');
      let files = response.result.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          console.log('GapiService.listFiles() file:', file.name + ' (' + file.id + ')');
        }
      } else {
        console.log('GapiService.listFiles(): No files found.');
      }
    });
  } */
}

export const GapiService = new _GapiService();
