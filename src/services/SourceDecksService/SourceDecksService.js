import {decks} from "./fixtures.js";

class _SourceDecksService {
  constructor() {
    this.decks = decks;
    this.store = {
      deckIds: [],
      decks: {},
      slideThumbnails: {},
    };
  }

  /**
   * Sets ordered list of deck ids
   * @param {Array} deckIds
   */
  setDecks(deckIds) {
    this.store.deckIds = deckIds;
  }

  /**
   * Load a presentation
   * @param {string} deckId
   * @returns {Promise}
   */
  getDeck(deckId) {
    if (!this.store.deckIds.includes(deckId)) {
      this.store.deckIds.push(deckId);
    }
    return (!!this.store.decks[deckId])
      ? Promise.resolve(this.store.decks[deckId])
      : window.gapi.client.slides.presentations.get({
        "presentationId": deckId,
      }).then(res => this.store.decks[deckId] = JSON.parse(res.body), rej => { throw(rej); });
  }

  /**
   * Get list of slideIds
   * @param {string} deckId
   * @returns {Promise<Array>}
   */
  getSlideIds(deckId) {
    return this.getDeck(deckId).then(deck => deck.slides.map(slide => slide.objectId));
  }

  /**
   * Get a slide thumbnail
   * @param {string} deckId
   * @param {string} slideId
   * @returns {Promise}
   */
  getThumbnail(deckId, slideId) {
    return (!!this.store.slideThumbnails[deckId][slideId])
      ? Promise.resolve(this.store.slideThumbnails[deckId][slideId])
      : this.getDeck(deckId)
        .then(deck => {
          const slide = deck.slides.find(slide => slide.objectId === slideId);
          if (!slide) {
            throw(`Slide ${deckId}#${slideId} not found`);
          }
          return window.gapi.client.slides.presentations.pages.getThumbnail({
            "presentationId": deckId,
            "pageObjectId": slideId,
            "thumbnailProperties.thumbnailSize": "LARGE"
          })
        })
        .then(response => {
          console.log('SourceDeckService.getThumbnail', response);
        }, rej => {
          throw(rej);
        });
  }

  /**
   * Gets a list of decks, each {key:, value:}
   * @returns {Promise}
   */
  getDecksList() {
    return Promise.resolve(this.store.deckIds.map(key => ({ key: key, value: this.store.decks[key].title })));
  }
}

export const SourceDecksService = new _SourceDecksService();
