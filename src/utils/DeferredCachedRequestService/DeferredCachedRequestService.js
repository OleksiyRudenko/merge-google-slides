/**
 * Agents that employ Promises are served only.
 * Unsuccessful responses won't be cached.
 */

class _DeferredCachedRequestService {
  constructor() {
    this.debug = false;
    this.agentsCallsCount = 0;
    this.sleepingScheme = this.setSleepingScheme();
    this.isSleeping = false;
    this.requestCache = {
      // agent: { query: response },
    };
    this.requestQueue = [];
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
   * Serve request from cache || queue request+callback+sleep
   * @param {Object} request parameters
   * @param {Object} callbacks
   * @param {Number} sleepingTime until next request (ms), if undefined then use pre-set sleeping scheme
   * @returns {Boolean} false if !(agent||query), otherwise is true
   */
  request(request, callbacks, sleepingTime = undefined) {
    request = Object.assign({
      agent: window.fetch || null,
      query: null,
    }, request);
    callbacks = Object.assign({
      success: null,
      error: null,
    }, callbacks);
    if (!request.agent || !request.query) {
      callbacks.error && callbacks.error('DCRS.request(): No agent or query defined');
      return false;
    }
    this.debug && console.log('DCRS.request(): Received request', request, callbacks);
    if (this.requestCache[request.agent] && this.requestCache[request.agent][this._stringify(request.query)]) {
      this.debug && console.log('DCRS.request(): Serving from cache >>>>>>>>>>>', this.requestCache[request.agent][this._stringify(request.query)]);
      callbacks.success && callbacks.success(this.requestCache[request.agent][this._stringify(request.query)]);
    } else {
      this.debug && console.log('DCRS.request(): enqueuing');
      this._enqueue(Object.assign(request, callbacks, {sleepingTime}));
    }
    return true;
  }

  /**
   * Push a request item into queue
   * @param {Object} item
   * @private
   */
  _enqueue(item) {
    this.requestQueue.push(item);
    this._processQueue();
  }

  /**
   * Process items from queue
   * @private
   */
  _processQueue() {
    this.debug && console.log('DCRS._processQueue(): isSleeping==', this.isSleeping);
    if (!this.isSleeping) {
      if (!this.requestQueue.length) { // no queue
        this.debug && console.log('DCRS._processQueue(): No requests in queue');
        return;
      }
      this.isSleeping = true; // force requests enqueueing
      const request = this.requestQueue.shift();
      this.debug && console.log('DCRS._processQueue(): processing', request);
      if (this.requestCache[request.agent] && this.requestCache[request.agent][this._stringify(request.query)]) {
        this.debug && console.log('DCRS._processQueue(): serving', request, 'from cache >>>>>>>>>>>', this.requestCache[request.agent][this._stringify(request.query)],'<<<<<<');
        request.success && request.success(this.requestCache[request.agent][this._stringify(request.query)]);
        this.isSleeping = false;
        // process next
        this._processQueue();
      } else {
        // make real request
        this.debug && console.log('DCRS._processQueue(): Doing real request', request);
        this.agentsCallsCount++;
        const sleepingTime = (request.sleepingTime === undefined) ? this._getNextSleep() : request.sleepingTime;
        request.agent(request.query).then(response => {
          if (!this.requestCache[request.agent]) this.requestCache[request.agent] = {};
          // if (!this.requestCache[request.agent][this._stringify(request.query)]) this.requestCache[request.agent][this._stringify(request.query)] = null; // reserve a place
          this.debug && console.log('DCRS._processQueue(): For', request, 'caching and serving >>>>>>>>>>>', response,'<<<<<<');
          this.requestCache[request.agent][this._stringify(request.query)] = response;
          request.success && request.success(response);
          this.debug && console.log('DCRS._processQueue(): going asleep for', sleepingTime + 'ms');
          window.setTimeout(()=>{
            this.debug && console.log('DCRS._processQueue(): awakened after successful response');
            this.isSleeping = false;
            this._processQueue();
          }, sleepingTime);
        }, rejection => {
          request.error && request.error(rejection);
          this.debug && console.log('DCRS._processQueue(): error', rejection);
          window.setTimeout(()=>{
            this.debug && console.log('DCRS._processQueue(): awakened after error');
            this.isSleeping = false;
            this._processQueue();
          }, sleepingTime);
        });
        // sleep and then process next
      }
    }
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
   * Stringifies data unless
   * @param data
   * @private
   */
  _stringify(data) {
    return (typeof data === 'string') ? data : JSON.stringify(data);
  }
}

export const DeferredCachedRequestService = new _DeferredCachedRequestService();
