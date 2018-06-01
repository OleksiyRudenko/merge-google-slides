// To import the self-initiated service: import {ServiceName} from "./services/ServiceName";
// To import service class: import ServiceClassName from "./services/ServiceName";
// Inspired by:
// https://developers.google.com/drive/api/v3/quickstart/js
// https://github.com/BespokeView/Load-Google-API/blob/master/src/index.js
// https://developers.google.com/identity/protocols/OAuth2UserAgent
// https://github.com/google/google-api-javascript-client/issues/319 -- se React

import * as binder from '../../utils/bind.js';

export default class _GapiService {
  constructor(gapiParams) {
    this.gapiParams = this._normalizeClientInitParams(gapiParams);
    binder.bind(this, '_handleClientLoad', '_initClient', '_updateSigninStatus', '_handleAuthClick', '_handleSignoutClick');
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
    window.gapi.client.init(this.gapiParams)
      .then(() => {
      // Listen for sign-in state changes.
      window.gapi.auth2.getAuthInstance().isSignedIn.listen(this._updateSigninStatus);

      // Handle the initial sign-in state.
      updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = this._handleAuthClick;
      signoutButton.onclick = this._handleSignoutClick;
    });
  }

  /**
   * Normalizes api initialization params
   * @param options
   * @returns {object}
   * @private
   */
  _normalizeClientInitParams(params) {
    return Object.assign(params, {scope: params.scope.join(' ')});
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  _updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
      authorizeButton.style.display = 'none';
      signoutButton.style.display = 'block';
      this.listFiles();
    } else {
      authorizeButton.style.display = 'block';
      signoutButton.style.display = 'none';
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  _handleAuthClick(event) {
    window.gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  _handleSignoutClick(event) {
    window.gapi.auth2.getAuthInstance().signOut();
  }

  /**
   * Append a pre element to the body containing the given message
   * as its text node. Used to display the results of the API call.
   *
   * @param {string} message Text to be placed in pre element.
   */
  appendPre(message) {
    let pre = document.getElementById('content');
    let textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
  }

  /**
   * Print files.
   */
  listFiles() {
    window.gapi.client.drive.files.list({
      'pageSize': 10,
      'fields': "nextPageToken, files(id, name)"
    }).then(response => {
      this.appendPre('Files:');
      let files = response.result.files;
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          let file = files[i];
          this.appendPre(file.name + ' (' + file.id + ')');
        }
      } else {
        this.appendPre('No files found.');
      }
    });
  }
}

// export const Gapi = new _Gapi();
