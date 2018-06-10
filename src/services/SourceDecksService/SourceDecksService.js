import {decks} from "./fixtures.js";

class _SourceDecksService {
  constructor() {
    this.decks = decks;
  }

  /**
   * Gets a list of decks, each {key:, value:}
   * @returns {Promise}
   */
  getDecksList() {
    return Promise.resolve(this.decks.list.map(key => ({ key: key, value: this.decks.names[key] })));
  }

  getSlidePreview(id, style="general", text="slide", pageNr = null) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttributeNS(null, "id", id);
    svg.setAttributeNS(null, "height", 75);
    svg.setAttributeNS(null, "width", 100);

  }
}

export const SourceDecksService = new _SourceDecksService();
