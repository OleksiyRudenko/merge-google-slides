import {decks} from "./fixtures.js";
import KoalaJs from "../../utils/koala-js-promisified";

class _SourceDecksService {
  constructor() {
    this.decks = decks;
    this.store = {
      deckIds: [],
      decks: {},
      slideThumbnailUrls: {},
    };
  }

  /**
   * Sets ordered list of deck ids
   * @param {Array} deckIds
   */
  setDeckIds(deckIds) {
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
      : KoalaJs.request({ agent: window.gapi.client.slides.presentations.get, query: {
        "presentationId": deckId,
        "fields": "title,slides.objectId",
      }}).then(res => this.store.decks[deckId] = JSON.parse(res.body), rej => { throw new Error({error:rej}); });
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
   * @returns {Promise<Array>}
   */
  getSlideIds(deckId) {
    return this.getDeck(deckId).then(deck => deck.slides.map(slide => slide.objectId));
  }

  /**
   * Get a slide thumbnail
   * @param {string} deckId
   * @param {string} slideId
   * @param {number} width
   * @returns {Promise}
   */
  getThumbnail(deckId, slideId, width = 400) {
    if (!this.store.slideThumbnailUrls[deckId]) this.store.slideThumbnailUrls[deckId] = {};
    return (!!this.store.slideThumbnailUrls[deckId][slideId])
      ? Promise.resolve(this.store.slideThumbnailUrls[deckId][slideId])
      : this.getDeck(deckId)
        .then(deck => {
          const slide = deck.slides.find(slide => slide.objectId === slideId);
          if (!slide) {
            throw new Error(`Slide ${deckId}#${slideId} not found`);
          }
          return KoalaJs.request({
            agent: window.gapi.client.slides.presentations.pages.getThumbnail,
            query: {
              "presentationId": deckId,
              "pageObjectId": slideId,
              "thumbnailProperties.thumbnailSize": "LARGE"
            }
          })
            .then(response => {
              console.log('SourceDeckService.getThumbnail() response', response);
              return JSON.parse(response.body);
            }, rej => {
              throw new Error(rej);
            })
            .then(data => {
              console.log('SourceDeckService.getThumbnail() body ', data);
              // replace terminal =s[\d+$] with required width
              const rgxp = new RegExp(`=s${data.width}$`);
              const url = data.contentUrl.replace(rgxp, `=s${width}`);
              this.store.slideThumbnailUrls[deckId][slideId] = url;
              return url;
            });
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
