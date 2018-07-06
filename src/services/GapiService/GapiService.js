// To import the self-initiated service: import {ServiceName} from "./services/ServiceName";
// To import service class: import ServiceClassName from "./services/ServiceName";
// Inspired by:
// https://developers.google.com/drive/api/v3/quickstart/js
// https://github.com/BespokeView/Load-Google-API/blob/master/src/index.js
// https://developers.google.com/identity/protocols/OAuth2UserAgent
// https://github.com/google/google-api-javascript-client/issues/319 -- se React

import {bindHandlers} from '../../utils/bind.js';

class GapiService {
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
    gapiScriptTag.async = true;
    gapiScriptTag.type = 'text/javascript';
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
   * Sets gapiProps.login_hint
   * @param userId
   */
  setGoogleLoginHint(userId) {
    if (!!userId) {
      this.gapiParams.login_hint = userId;
    } else {
      delete this.gapiParams.login_hint;
    }
  }

  /**
   * On load, called to load the auth2 library and API client library.
   * @private
   */
  _handleClientLoad() {
    window.gapi.load('client:auth2:picker', this._initClient);
  }

  /**
   * Initializes the API client library and sets up sign-in state
   * listeners.
   * @private
   */
  _initClient() {
    return window.gapi.client.init(this._normalizeClientInitParams(this.gapiParams)) // .init mutates the params object
      .then(() => {
        this.setState({isClientLoaded: true}, 'GapiService._initClient().then(success)');

        // Listen for sign-in state changes.
        // window.gapi.auth2.getAuthInstance().isSignedIn.listen(this._updateSigninStatus);

        // Handle the initial sign-in state.
        const googleAuth = window.gapi.auth2.getAuthInstance();
        // console.log('Gapi._initClient() googleAuth', googleAuth);

        googleAuth.then(auth => {
          const isSignedIn = auth.isSignedIn.get();
          this._updateSigninStatus(isSignedIn, true, '_initClient().then(success)');
        });
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
    return Object.assign({}, params, {
      redirect_uri: this._getCurrentUri(),
    }, (typeof params.scope === 'string') ? {} : {scope: params.scope.join(' ')});
  }

  _getCurrentUri() {
    const wloc = window.location;
    return wloc.protocol + '//' + wloc.host + wloc.pathname;
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
    window.gapi.auth2.getAuthInstance().signIn().then((data) => {
      console.log('Gapi.handleAuthClick().success', data);
      this.setState({
        isSignedIn: true,
        isSignInRequired: false,
      }, 'handleAuthClick');
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
    }, error => { throw new Error(error)});
  }

  handleRevokeAccess() {
    window.gapi.auth2.getAuthInstance().disconnect();
    // SET STATE!
  }

  /**
   * Renders Default sign in button
   * @param {callback|object} [callbacks] {onSuccess,onFailure}
   * @param {string|number|Object} [ui] {id,width,height,longtitle(true|false),theme(dark|light}
   */
  renderSignInButton(callbacks = undefined,
                     ui = undefined) { // domElementId, dims = 50, onSuccess = undefined, onFailure = undefined) {
    ui = this._normalizeGoogleSignInButtonUi(ui);
    callbacks = this._normalizeGoogleSignInButtonCallbacks(callbacks);
    console.log('GapiService.renderSignInButton', ui, callbacks);
    window.gapi.signin2.render(ui.id, {
      scope: 'profile email', // 'https://www.googleapis.com/auth/plus.login'
      width: ui.width,
      height: ui.height,
      longtitle: ui.longtitle,
      theme: ui.theme,
      onsuccess: callbacks.onSuccess,
      onfailure: callbacks.onFailure,
    });
  }

  renderGSuiteIntegrateWithGoogleButton(container = '', ui = {}) {
    ui = Object.assign({}, {
      width: 250,
      theme: 'light',
    }, ui);
    if (this.gapiParams.applicationId) {
      window.gapi.additnow.render(container, {applicationid: this.gapiParams.applicationId});
    }
  }

  /**
   * Normalizes Google Sign In button dimensions
   * @param {string|number|Object} [ui] {id,width,height,longtitle(true|false),theme(dark|light}
   * @returns {Object}
   * @private
   */
  _normalizeGoogleSignInButtonUi(ui = undefined) {
    const defaultDims = {
      height: { // min width for given height
        0: 150, 30: 150, 50: 200,
      },
      width: { // min height for given width
        0: 30, 150: 30, 200: 50,
      },
    };
    if (!ui) {ui = {};}
    if (typeof ui === 'string') ui = {id: ui};
    if (Number.isInteger(ui)) ui = {height: ui};
    ui = Object.assign({
      id: 'g-signin2',
      height: 50,
      longtitle: true,
      theme: 'dark',
    }, ui);
    if (!ui.width) { ui.width = defaultDims.height[ui.height]; }
    if (!ui.height) { ui.height = defaultDims.width[ui.width]; }
    return ui;
  }

  /**
   * Normalizes Google Sign In button action callbacks
   * @param {callback|object} [callbacks] {onSuccess,onFailure}
   * @returns {object}
   * @private
   */
  _normalizeGoogleSignInButtonCallbacks(callbacks = undefined) {
    if (!callbacks) { callbacks = {onSuccess: undefined, onFailure: undefined }; }
    if (typeof callbacks === 'function') { callbacks = {onSuccess: callbacks, onFailure: undefined }; }
    return callbacks;
  }

  /**
   * Gets current user profile
   * @returns {Promise}
   */
  getUserProfile() {
    return window.gapi.auth2.getAuthInstance().then(auth => {
      const isSignedIn = auth.isSignedIn.get();
      if (isSignedIn) {
        const googleUser = auth.currentUser.get();
        const profile = googleUser.getBasicProfile();
        return {
          profile: {
            id: profile.getId(),
            name: profile.getName(),
            email: profile.getEmail(),
            image: profile.getImageUrl(),
            givenName: profile.getGivenName(),
            familyName: profile.getFamilyName(),
          },
          authData: googleUser.getAuthResponse(true),
        };
      } else {
        throw new Error('No user logged in');
      }
    });
  }

  getGDriveInstallationUrl() {
    const gapiParams = this._normalizeClientInitParams(this.gapiParams);
    const queryParams = {
      redirect_uri: gapiParams.gDrive.installationCallBackUrl,
      response_type: gapiParams.gDrive.installationCodeParamName,
      client_id: gapiParams.clientId,
      approval_prompt: 'force',
      scope: gapiParams.scope,
      access_type: 'offline',
    };
    if (gapiParams.login_hint) {
      queryParams.login_hint = gapiParams.login_hint;
    }
    return new URL('?' + new URLSearchParams(queryParams), 'https://accounts.google.com/o/oauth2/auth');
  }

  /**
   * Updates service state ReactJS-style
   * @param {Object} stateUpdate
   * @param {string} caller
   */
  setState(stateUpdate, caller='unknown') {
    // console.log('GapiService.setState() called by ' + caller + ' to update', this.state, 'with', stateUpdate);
    this.state = Object.assign(this.state, stateUpdate);
    // console.log('GapiService.setState() updated state', this.state);
    this.stateHandler && this.stateHandler(this.state);
  }

  /**
   * Creates Google Picker instance for Presentations
   * @param {callback} callback to call when user completes Picker action
   */
  createPickerPresentations(callback) {
    this.getUserProfile().then(profile => {
      const gpapi = window.google.picker;
      console.log('>>>>>>>>>>>>', gpapi);

      const picker = new gpapi.PickerBuilder()
        .enableFeature(gpapi.Feature.SUPPORT_TEAM_DRIVES)
        .enableFeature(gpapi.Feature.MULTISELECT_ENABLED)
        .addView(new gpapi.DocsView(gpapi.ViewId.PRESENTATIONS) // gpapi.ViewId.PRESENTATIONS
            .setMimeTypes('application/vnd.google-apps.presentation')
          //  .setIncludeFolders(true)
          // .setSelectFolderEnabled(true)
          // .setEnableTeamDrives(true)
        )
        .setMaxItems(3)
        .addView(new gpapi.DocsView(gpapi.ViewId.PRESENTATIONS)
          .setMimeTypes('application/vnd.google-apps.presentation')
          .setIncludeFolders(true)
          // .setMode(gpapi.DocsViewMode.LIST)
          // .setSelectFolderEnabled(true)
          // .setEnableTeamDrives(true)
          .setLabel('Browse folders')
        )
        .setMaxItems(3)
        .addView(gpapi.ViewId['RECENTLY_PICKED'])
        .setMaxItems(3)
          // https://developers.google.com/picker/docs/
        // .addView(new window.google.picker.DocsUploadView())
        .setOAuthToken(profile.authData.access_token)
        // .setDeveloperKey('AIzaSyDLomXTkw7nadJGzSJKAdX3Mla22NKEWuQ')
        .setAppId(this.gapiParams.clientId)
        .setCallback(callback)
        .build();
      picker.setVisible(true);
    });
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

export default new GapiService();
