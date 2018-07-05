class GapiConfigService {
  gapiConfig;

  constructor(gapiConfig) {
    this.init(gapiConfig);
  }

  /**
   * Initializes gapi config service with parameters
   * @param {Object} gapiConfig
   */
  init(gapiConfig) {
    if (gapiConfig) {
      gapiConfig.oauth = this._normalizeOAuthParams(gapiConfig.oauth);
      this.gapiConfig = gapiConfig;
    }
  }

  /**
   * Gets list of oauth params subsets
   * @returns {Array}
   */
  getOAuthSubSetsList() {
    return Object.keys[this.gapiConfig.oauth];
  }

  /**
   * Sets oauth param for a named subset
   * @param {string} paramName
   * @param {*} paramValue
   * @param {string} subSet
   */
  setOAuthParam(paramName, paramValue, subSet = 'default') {
    this.gapiConfig.oauth[subSet][paramName] = paramValue;
  }

  /**
   * Delete param from a named oauth params subset
   * @param {string} paramName
   * @param {string} subSet
   */
  deleteOAuthParam(paramName, subSet = 'default') {
    if (this.gapiConfig.oauth[subSet][paramName]) {
      delete this.gapiConfig.oauth[subSet][paramName];
    }
  }

  /**
   * Sets login_hint for a given oauth params subset
   * @param {string} userId
   * @param {string} subSet
   */
  setGoogleLoginHint(userId, subSet = 'default') {
    if (!!userId) {
      this.setOAuthParam('login_hint', userId, subSet);
    } else {
      this.deleteOAuthParam('login_hint', subSet);
    }
  }

  /**
   * Sets redirect_uri for a given oauth params subset
   * @param {string} uri
   * @param {string} subSet
   */
  setRedirectUri(uri, subSet = 'default') {
    if (!!uri) {
      this.setOAuthParam('redirect_uri', uri, subSet);
    } else {
      this.deleteOAuthParam('redirect_uri', subSet);
    }
  }

  /**
   * Returns an OAuth object: default set is complemented by other subset(s) or
   * @param {string|Array|Object} [subSet] e.g. 'gDrive' | {redirect_uri:somePath} | [ 'gDrive', 'extras', {code:someCode} ]
   */
  getOAuthObject(subSet) {
    if (!subSet) {
      subSet = [];
    }
    // move string subSet into array
    if (typeof subSet === 'string') {
      subSet = [subSet];
    }
    // move object subSet into array
    if (!Array.isArray(subSet)) {
      subSet = [subSet];
    }
    // resolve string subsets into objects
    let subSetList = subSet.map(item => typeof item === 'string' ? this.getOAuthSubSetObject(item) : item);
    return Object.assign({}, this.gapiConfig.oauth.default, ...subSetList);
  }

  /**
   * Gets an oauth params subset
   * @param {string} subSet
   * @returns {Object} cloned oauth params object
   */
  getOAuthSubSetObject(subSet) {
    return Object.assign({}, this.gapiConfig.oauth[subSet]);
  }

  /**
   * Returns filtered oAuthObject
   * @param {Object} oAuthObject
   * @param {Array<string>} [params] if empty then oAuthObject is just cloned
   * @returns {Object} new oAuthObject
   */
  filterOAuthParams(oAuthObject, params = []) {
    if (!params.length) {
      return Object.assign({}, oAuthObject);
    }
    let targetOAuthObject = {};
    params.forEach(param => {
      targetOAuthObject[param] = oAuthObject[param];
    });
    return targetOAuthObject;
  }

  /**
   * Compose an oauth url/uri
   * @param {Object|string|Array} paramsMap mapping rules; if empty then oAuthObject is used as is;
   *        If string then => {param:param}; If Array then listed params are filtered from oAuthObject;
   *        If no param in oAuthObject then empty string assigned
   * @param {Object|string|Array} oAuthObject; if undefined then oauth params default subset is used;
   *        If array|string then getOAuthObject() is applied
   * @param {string} url; if not empty then search parameters are prepended with '?'
   * @returns {string} resulting uri
   */
  getOAuthUri(paramsMap = {}, oAuthObject = undefined, url = '') {
    // console.log('paramsMap, oAuthObject, url',paramsMap, oAuthObject, url);
    if (url.length) {
      url += '?';
    }
    if (!typeof oAuthObject === 'string' && !Array.isArray(oAuthObject) && !Object.keys(oAuthObject).length) {
      oAuthObject = undefined;
    }
    if (!oAuthObject || typeof oAuthObject === 'string' || Array.isArray(oAuthObject) || !Object.keys(oAuthObject).length) {
      oAuthObject = this.getOAuthObject(oAuthObject);
      // console.log(oAuthObject);
    }
    if (!paramsMap) {
      paramsMap = {};
    }
    if (typeof paramsMap === 'string') {
      paramsMap = { params: paramsMap };
    }
    if (!Array.isArray(paramsMap) && !Object.keys(paramsMap).length) {
      paramsMap = Object.keys(oAuthObject);
    }
    if (Array.isArray(paramsMap)) {
      let dictionary = {};
      paramsMap.forEach(param => { dictionary[param] = param; });
      paramsMap = dictionary;
    }
    // console.log('paramsMap, oAuthObject, url',paramsMap, oAuthObject, url);
    // build search string
    const params = {};
    Object.keys(paramsMap).forEach(key => { params[key] = oAuthObject[paramsMap[key]] || ''; });
    const searchString = Object.keys(params)
        .map(param => encodeURIComponent(param) + '=' + encodeURIComponent(params[param]))
        .join('&');
    return url + searchString;
  }

  /**
   * Normalizes oauth params. E.g. .scopeList[] becomes .scope='scopeList[0] scopeList[1] scopeList[2]...'
   * @param params
   * @returns {object}
   * @private
   */
  _normalizeOAuthParams(params) {
    Object.keys(params).forEach(key => {
      if (params[key].scopeList) {
        params[key].scope = params[key].scopeList.join(' ');
        delete params[key].scopeList;
      }
    });
    return Object.assign({}, params);
  }
}

export default new GapiConfigService();
