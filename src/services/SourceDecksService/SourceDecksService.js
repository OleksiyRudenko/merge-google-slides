import {decks} from "./fixtures.js";
import KoalaJs from "../../utils/koala-js-promisified";

class SourceDecksService {
  _asyncRequestTokensCount = 0;
  static _AsyncRequestMode = {
    DISCARD_THIS_IF_ANY_PENDING: 'DISCARD_THIS_IF_ANY_PENDING',
    DISCARD_PREV: 'DISCARD_PREV',
    SERVE_FIRST_RESOLVED: 'SERVE_FIRST_RESOLVED',
  };
  _registeredAsyncRequests = {
    /*
    tokenId: { requestCount: 0, aliveRequestIds: {} },
     */
  };

  constructor() {
    this.debug = false;
    this.decks = decks;
    this.clearCache(false);
  }

  get AsyncRequestMode() { return SourceDecksService._AsyncRequestMode; }
  get DISCARD_THIS_IF_ANY_PENDING() { return SourceDecksService._AsyncRequestMode.DISCARD_THIS_IF_ANY_PENDING; }
  get DISCARD_PREV() { return SourceDecksService._AsyncRequestMode.DISCARD_PREV; }
  get SERVE_FIRST_RESOLVED() { return SourceDecksService._AsyncRequestMode.SERVE_FIRST_RESOLVED; }

  /**
   * Sets ordered list of deck ids
   * @param {Array} deckIds
   */
  setDeckIds(deckIds) {
    this.store.deckIds = deckIds;
  }

  /**
   * Appends deck ids to the list. Dups not checked
   * @param {Array} deckIds
   */
  appendDeckIds(deckIds) {
    this.store.deckIds.push(...deckIds);
  }

  /**
   * Removes a deckId from the list
   * @param {string} deckId
   */
  deleteDeckId(deckId) {
    this.debug && console.log('>>>>>>>>>', deckId, this.store.deckIds);
    this.store.deckIds = this.store.deckIds.filter(item => item !== deckId);
    this.debug && console.log('>>>>>>>>>', deckId, this.store.deckIds);
  }

  /**
   * Load a presentation
   * @param {string} deckId
   * @param {Object} asyncRequestToken
   * @returns {Promise}
   */
  getDeck(deckId, asyncRequestToken = null) {
    const requestId = this._getNextAsyncRequestId(asyncRequestToken);
    if (asyncRequestToken) {
      this._registerAsyncRequestToken(asyncRequestToken);
      if (asyncRequestToken.mode === this.DISCARD_THIS_IF_ANY_PENDING && this._getPendingAsyncRequestsCount(asyncRequestToken)) {
        return this._swallow(`getDeck(${deckId}`, asyncRequestToken);
      }
      if (asyncRequestToken.mode === this.DISCARD_PREV) {
        this.discardPendingAsyncRequests(asyncRequestToken);
      }
      this._addAsyncRequest(asyncRequestToken, requestId);
    }

    if (!this.store.deckIds.includes(deckId)) {
      this.store.deckIds.push(deckId);
    }
    if (!!this.store.decks[deckId]) {
      if (asyncRequestToken) {
        if (!this._isAsyncRequestAlive(asyncRequestToken, requestId)) {
          return this._swallow(`getDeck(${deckId}) as request's been discarded`, asyncRequestToken);
        }
        if (asyncRequestToken.mode === this.SERVE_FIRST_RESOLVED) {
          this.discardPendingAsyncRequests(asyncRequestToken);
        } else {
          this._deleteAsyncRequest(asyncRequestToken, requestId); // unregister the request as it will be successfully resolved
        }
      }

      return Promise.resolve(this.store.decks[deckId]);
    } else {
      return KoalaJs.request({ agent: window.gapi.client.slides.presentations.get, query: {
          "presentationId": deckId,
          "fields": "title,slides.objectId",
        }})
        .then(res => {
            if (asyncRequestToken) {
              if (!this._isAsyncRequestAlive(asyncRequestToken, requestId)) {
                return this._swallow(`getDeck(${deckId}) as request's been discarded`, asyncRequestToken);
              }
              if (asyncRequestToken.mode === this.SERVE_FIRST_RESOLVED) {
                this.discardPendingAsyncRequests(asyncRequestToken);
              } else {
                this._deleteAsyncRequest(asyncRequestToken, requestId); // unregister the request as it will be successfully resolved
              }
            }
            return this.store.decks[deckId] = JSON.parse(res.body)
          },
          rej => { throw new Error({error:rej}); });
    }
  }

  /**
   * Get current deck ids
   * @returns {Array}
   */
  getDeckIds() {
    return this.store.deckIds;
  }

  /**
   * Get list of slideIds
   * @param {string} deckId
   * @param {Object} asyncRequestToken
   * @returns {Promise<Array>}
   */
  getSlideIds(deckId, asyncRequestToken = null) {
    this.debug && console.log('SourceDecksService.getSlideIds()', deckId);
    const requestId = this._getNextAsyncRequestId(asyncRequestToken);
    if (asyncRequestToken) {
      this._registerAsyncRequestToken(asyncRequestToken);
      if (asyncRequestToken.mode === this.DISCARD_THIS_IF_ANY_PENDING && this._getPendingAsyncRequestsCount(asyncRequestToken)) {
        return this._swallow(`getSlideIds(${deckId})`, asyncRequestToken);
      }
      if (asyncRequestToken.mode === this.DISCARD_PREV) {
        this.discardPendingAsyncRequests(asyncRequestToken);
      }
      this._addAsyncRequest(asyncRequestToken, requestId);
    }

    return this.getDeck(deckId).then(deck => {
      if (asyncRequestToken) {
        if (!this._isAsyncRequestAlive(asyncRequestToken, requestId)) {
          return this._swallow(`getSlideIds(${deckId}) as request's been discarded`, asyncRequestToken);
        }
        if (asyncRequestToken.mode === this.SERVE_FIRST_RESOLVED) {
          this.discardPendingAsyncRequests(asyncRequestToken);
        } else {
          this._deleteAsyncRequest(asyncRequestToken, requestId); // unregister the request as it will be successfully resolved
        }
      }
      return deck.slides.map(slide => slide.objectId);
    });
  }

  /**
   * Get a slide thumbnail
   * @param {string} deckId
   * @param {string} slideId
   * @param {number} width
   * @param {Object} asyncRequestToken
   * @returns {Promise}
   */
  getThumbnail(deckId, slideId, width = 400, asyncRequestToken) {
    if (!this.store.slideThumbnailUrls[deckId]) this.store.slideThumbnailUrls[deckId] = {};

    const requestId = this._getNextAsyncRequestId(asyncRequestToken);
    if (asyncRequestToken) {
      this._registerAsyncRequestToken(asyncRequestToken);
      if (asyncRequestToken.mode === this.DISCARD_THIS_IF_ANY_PENDING && this._getPendingAsyncRequestsCount(asyncRequestToken)) {
        return this._swallow(`getThumbnail(${deckId}, ${slideId})`, asyncRequestToken);
      }
      if (asyncRequestToken.mode === this.DISCARD_PREV) {
        this.discardPendingAsyncRequests(asyncRequestToken);
      }
      this._addAsyncRequest(asyncRequestToken, requestId);
    }

    if (!!this.store.slideThumbnailUrls[deckId][slideId]) {
      if (asyncRequestToken) {
        if (!this._isAsyncRequestAlive(asyncRequestToken, requestId)) {
          return this._swallow(`getThumbnail(${deckId}, ${slideId}) as request's been discarded`, asyncRequestToken);
        }
        if (asyncRequestToken.mode === this.SERVE_FIRST_RESOLVED) {
          this.discardPendingAsyncRequests(asyncRequestToken);
        } else {
          this._deleteAsyncRequest(asyncRequestToken, requestId); // unregister the request as it will be successfully resolved
        }
      }
      return Promise.resolve(this.store.slideThumbnailUrls[deckId][slideId]);
    } else {
      return this.getDeck(deckId)
        .then(deck => {
          if (asyncRequestToken) {
            if (!this._isAsyncRequestAlive(asyncRequestToken, requestId)) {
              return this._swallow(`getThumbnail(${deckId}, ${slideId}) as request's been discarded`, asyncRequestToken);
            }
            if (asyncRequestToken.mode === this.SERVE_FIRST_RESOLVED) {
              this.discardPendingAsyncRequests(asyncRequestToken);
            } else {
              this._deleteAsyncRequest(asyncRequestToken, requestId); // unregister the request as it will be successfully resolved
            }
          }

          const slide = deck.slides.find(slide => slide.objectId === slideId);
          if (!slide) {
            throw new Error(`Slide ${deckId}.${slideId} not found`);
          }
          return KoalaJs.request({
            agent: window.gapi.client.slides.presentations.pages.getThumbnail,
            query: {
              "presentationId": deckId,
              "pageObjectId": slideId,
              "thumbnailProperties.thumbnailSize": "LARGE"
            }
          })
        })
        .then(response => {
          // this.debug && console.log('SourceDeckService.getThumbnail() response', response);
          return JSON.parse(response.body);
        })
        .then(data => {
          // this.debug && console.log('SourceDeckService.getThumbnail() body ', data);
          // replace terminal =s[\d+$] with required width
          const rgxp = new RegExp(`=s${data.width}$`);
          const url = data.contentUrl.replace(rgxp, `=s${width}`);
          this.store.slideThumbnailUrls[deckId][slideId] = url;
          return url;
        })
        .catch(rej => {
          console.error(rej);
          throw new Error(rej);
        });
    }
  }

  /**
   * Move deckId in a list
   * @param {Number} currentOrderPosition
   * @param {Number} targetOffset (<0 to the left, >0 to the right)
   * @returns {Boolean} any changes happened?
   */
  moveDeckId(currentOrderPosition, targetOffset) {
    if (this.store.deckIds.length && currentOrderPosition < this.store.deckIds.length && targetOffset ) {
      let newPosition = currentOrderPosition + targetOffset;
      if (newPosition < 0) newPosition = 0;
      if (newPosition > this.store.deckIds.length) newPosition = this.store.deckIds.length - 1;
      if (newPosition === currentOrderPosition) return false;
      // relocate item
      // this.store.deckIds = [];
      const tmp = this.store.deckIds[currentOrderPosition];
      if (currentOrderPosition < newPosition) {
        // target element down, other elements up
        for (let i = currentOrderPosition; i < newPosition; i++) {
          this.store.deckIds[i] = this.store.deckIds[i + 1];
        }
      } else {
        // target element up, other elements down
        for (let i = currentOrderPosition; i > newPosition; i--) {
          this.store.deckIds[i] = this.store.deckIds[i - 1];
        }
      }
      this.store.deckIds[newPosition] = tmp;
      return true;
    } else {
      return false;
    }
  }

  /**
   * Gets a list of decks, each {key:, value:}
   * @returns {Promise}
   */
  /* getDecksList() {
    return Promise.resolve(this.store.deckIds.map(key => ({ key: key, value: this.store.decks[key].title })));
  } */

  /**
   * Clears caches
   * @param {Boolean} clearDeeper into underlying caching service
   */
  clearCache(clearDeeper = true) {
    this.store = {
      deckIds: [],
      decks: {},
      slideThumbnailUrls: {},
    };
    clearDeeper && KoalaJs.clearCache();
  }

  /**
   * Creates request token for async requests.
   * Requests for the token presented will be served in the given mode
   * @param {string} mode one of 'DISCARD_PREV'|'SERVE_FIRST_RESOLVED'|'DISCARD_THIS_IF_ANY_PENDING'
   * See README.md for details
   */
  createAsyncRequestToken(mode = this.DISCARD_PREV) {
    return {
      tokenId: 'art' + ++this._asyncRequestTokensCount,
      mode,
    };
  }

  /**
   * All requests per token will be discarded
   * @param {Object<{token,mode}>|string} asyncRequestToken if ==='all' then all pending requests for all token are reset
   */
  discardPendingAsyncRequests(asyncRequestToken = 'all') {
    if (asyncRequestToken === 'all') {
      Object.keys(this._registeredAsyncRequests).forEach(tokenId => {
        this._registeredAsyncRequests[tokenId].aliveRequestIds = {};
      });
    } else {
      this._registeredAsyncRequests[asyncRequestToken.tokenId].aliveRequestIds = {};
    }
  }

  /**
   * Registers asyncRequestToken if not yet
   * @param {Object} asyncRequestToken
   * @private
   */
  _registerAsyncRequestToken(asyncRequestToken) {
    if (!this._registeredAsyncRequests[asyncRequestToken.tokenId]) {
      this._registeredAsyncRequests[asyncRequestToken.tokenId] = {
        requestCount: 0,
        aliveRequestIds: {},
      }
    }
  }

  /**
   * Checks if any pending requests are associated with given token
   * @param {Object} asyncRequestToken
   * @private
   */
  _getPendingAsyncRequestsCount(asyncRequestToken) {
    return Object.keys(this._registeredAsyncRequests[asyncRequestToken.tokenId].aliveRequestIds).length;
  }

  /**
   * Creates new request id for a token
   * @param {Object} asyncRequestToken
   * @returns {number}
   * @private
   */
  _getNextAsyncRequestId(asyncRequestToken = null) {
    return asyncRequestToken ? ++this._registeredAsyncRequests[asyncRequestToken.tokenId].requestCount : 0;
  }

  /**
   * Checks if the request not discarded
   * @param {Object} asyncRequestToken
   * @param {string} requestId
   * @returns {Boolean}
   * @private
   */
  _isAsyncRequestAlive(asyncRequestToken, requestId) {
    return !!this._registeredAsyncRequests[asyncRequestToken.tokenId].aliveRequestIds[requestId];
  }

  /**
   * Register request among alive
   * @param {Object} asyncRequestToken
   * @param {string} requestId
   * @private
   */
  _addAsyncRequest(asyncRequestToken, requestId) {
    this._registeredAsyncRequests[asyncRequestToken.tokenId].aliveRequestIds[requestId] = requestId;
  }

  /**
   * Deletes request from alive
   * @param {Object} asyncRequestToken
   * @param {string} requestId
   * @private
   */
  _deleteAsyncRequest(asyncRequestToken, requestId) {
    delete this._registeredAsyncRequests[asyncRequestToken.tokenId].aliveRequestIds[requestId];
  }

  /**
   * Rejects (swallows) request
   * @param {string} message
   * @param {Object} asyncRequestToken
   * @private
   */
  _swallow(message, asyncRequestToken) {
    return Promise.reject(`SourceDecksService swallows ${message} in mode ${asyncRequestToken.mode} for tokenId ${asyncRequestToken.tokenId}`);
  }
}

export default new SourceDecksService();
