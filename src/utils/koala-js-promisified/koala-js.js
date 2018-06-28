/**
 * Agents that employ Promises are served only.
 * Unsuccessful responses won't be cached.
 */
import {bindHandlers} from "../bind";

class _DeferredCachedRequestService {
  constructor() {
    this.debug = true;
    this.agentsCallsCount = 0;
    this.sleepingScheme = this.setSleepingScheme();
    this.isSleeping = false;
    this.usePersistentCache = false;
    this._persistentStorageName = 'KoalaJsCache';
    this.requestCache = {
      // agent: { query: response },
    };
    this.requestQueue = [];
    this.usePersistentCache && this._loadPersistentCache();
    bindHandlers(this, 'setSleepingScheme', 'setPersistency', 'request', '_enqueue', '_processQueue',
      '_getNextSleep', '_loadPersistentCache', '_savePersistentCache', '_clearPersistentCache',
      '_clearCache', '_stringify');
    this.debug && console.log('DCRS:', this.sleepingScheme);
  }

  /**
   * Overrides current sleeping scheme
   * @param {Object} sleepingScheme
   * {X:Y, ...} since Xth agent call response sleep for Y ms before processing next agent call
   */
  setSleepingScheme(sleepingScheme = {1: 300, 10: 500, 25: 1000 }) {
    return this.sleepingScheme = sleepingScheme;
  }

  /**
   * Set whether requestCache should survive between sessions
   * @param usePersistentCache
   * @returns {*}
   */
  setPersistency(usePersistentCache = true) {
    if (!usePersistentCache) {
      this._clearPersistentCache();
    }
    return this.usePersistentCache = usePersistentCache;
  }

  /**
   * Serve request from cache || queue request+callback+sleep
   * @param {Object} request parameters
   * @param {Number} sleepingTime until next request (ms), if undefined then use pre-set sleeping scheme
   * @returns {Promise}
   */
  request(request, sleepingTime = undefined) {
    request = Object.assign({
      agent: window.fetch || null,
      query: null,
      skipCaching: false,    // if true then do not cache (and remove cached data)
      forceRefresh: false,   // force non-cached response and update cache
    }, request);

    return new Promise((resolve, reject) => {
      if (!request.agent || !request.query) {
        reject(new Error('DCRS.request(): No agent or query defined'));
      }
      this.debug && console.log('DCRS.request(): Received request', request);
      const queryString = this._stringify(request.query);
      if (this.requestCache[request.agent] && this.requestCache[request.agent][queryString] && !(request.forceRefresh || request.skipCaching)) {
        this.debug && console.log('DCRS.request(): Serving from cache >>>>>>>>>>>', this.requestCache[request.agent][queryString]);
        resolve(this.requestCache[request.agent][queryString]);
      } else {
        this.debug && console.log('DCRS.request(): enqueuing');
        resolve(this._enqueue(Object.assign(request, {sleepingTime})));
      }
    });
  }

  /**
   * Push a request item into queue
   * @param {Object} item
   * @returns {Promise}
   * @private
   */
  _enqueue(item) {
    this.requestQueue.push(item);
    return this._processQueue();
  }

  /**
   * Process items from queue
   * @returns {Promise}
   * @private
   */
  _processQueue() {
    return new Promise((resolve, reject) => {
      if (this.isSleeping) {
        this.debug && console.log('DCRS._processQueue(): Sleeping==', this.isSleeping, 'while queue contains', this.requestQueue);
        window.setTimeout(resolve.bind(null, this._processQueue), 50);
      } else {
        if (!this.requestQueue.length) { // no queue
          reject(new Error('DCRS._processQueue(): No requests in queue'));
        } else {
          this.isSleeping = true; // force other requests enqueueing
          const request = this.requestQueue.shift();
          const queryString = this._stringify(request.query);
          this.debug && console.log('DCRS._processQueue(): processing', request);
          if (request.forceRefresh || request.skipCaching) {
            this._clearCache(request);
          }
          if (this.requestCache[request.agent] && this.requestCache[request.agent][queryString]) {
            this.debug && console.log('DCRS._processQueue(): serving', request, 'from cache >>>>>>>>>>>', this.requestCache[request.agent][queryString],'<<<<<<');
            this.isSleeping = false;
            resolve(this.requestCache[request.agent][queryString]);
            // process next
            // this._processQueue();
          } else {
            // make real request
            this.debug && console.log('DCRS._processQueue(): Doing real request', request);
            this.agentsCallsCount++;
            const sleepingTime = (request.sleepingTime === undefined) ? this._getNextSleep() : request.sleepingTime;
            return request.agent(request.query).then(response => {
              if (!this.requestCache[request.agent]) this.requestCache[request.agent] = {};
              // if (!this.requestCache[request.agent][queryString]) this.requestCache[request.agent][queryString] = null; // reserve a place
              this.debug && console.log('DCRS._processQueue(): For', request, (request.skipCaching?'':'caching and ') + 'serving >>>>>>>>>>>', response,'<<<<<<');
              if (!request.skipCaching) {
                this.requestCache[request.agent][queryString] = response;
                this.usePersistentCache && this._savePersistentCache();
              }
              this.debug && console.log('DCRS._processQueue(): going asleep for', sleepingTime + 'ms');
              window.setTimeout(()=>{
                this.debug && console.log('DCRS._processQueue(): awakened after successful response');
                this.isSleeping = false;
                // return this._processQueue();
              }, sleepingTime);
              resolve(response);
            }, rejection => {
              this.debug && console.log('DCRS._processQueue(): error', rejection);
              window.setTimeout(()=>{
                this.debug && console.log('DCRS._processQueue(): awakened after error');
                this.isSleeping = false;
                // this._processQueue();
              }, sleepingTime);
              reject(rejection);
            });
          }
        }
      }
    });
  }

  /**
   * Gets next sleep time from sleepingScheme
   * @private
   * @returns
   */
  _getNextSleep() {
    const thresholds = Object.keys(this.sleepingScheme);
    const idx = thresholds.find(threshold => this.agentsCallsCount >= threshold);
    return this.sleepingScheme[idx];
  }

  /**
   * Loads cache stored in browser persistent storage
   * @private
   */
  _loadPersistentCache() {
    if (typeof(window.localStorage) !== "undefined"  && window.localStorage[this._persistentStorageName]) {
      this.requestCache = Object.assign(JSON.parse(window.localStorage.getItem(this._persistentStorageName)), this.requestCache);
    }
  }

  /**
   * Saves cache in browser persistent storage
   * @private
   */
  _savePersistentCache() {
    if (typeof(window.localStorage) !== "undefined") {
      window.localStorage.setItem(this._persistentStorageName, JSON.stringify(this.requestCache));
    }
  }

  /**
   * Removes cache from browser persistent storage
   * @private
   */
  _clearPersistentCache() {
    if (typeof(window.localStorage) !== "undefined") {
      window.localStorage.removeItem(this._persistentStorageName);
    }
  }

  /**
   * Clears request cache
   * @private
   */
  _clearCache(agent = null, query = null) {
    if (typeof agent === 'string') {
      agent = {
        agent,
        query,
      }
    }
    if (agent.agent && this.requestCache[agent.agent]) {
      if (agent.query) {
        const queryString = this._stringify(agent.query);
        if (this.requestCache[agent.agent][queryString]) {
          delete this.requestCache[agent.agent][queryString];
        }
      } else {
        // remove all caches associated with a given agent
        delete this.requestCache[agent.agent];
      }
      // update persistent storage
      this.usePersistentCache && this._savePersistentCache();
    } else {
      // remove all
      this.requestCache = {};
      this._clearPersistentCache();
    }
  }

  /**
   * Stringifies query payload unless it is a string
   * @param data
   * @private
   */
  _stringify(data) {
    return (typeof data === 'string') ? data : JSON.stringify(data);
  }
}

export const KoalaJs = new _DeferredCachedRequestService();
