import * as xobject from "../../utils/xobject/xobject";

export default class PresentationPage {
  p = null;

  constructor (page = null, clone = false) {
    if (page && clone) {
      this.pageClone = page;
    } else {
      this.page = page;
    }
  }

  get page() { return this.p; }
  get pageClone() { return xobject.deepClone(this.p); }
  set page(page) { this.p = page; }
  set pageClone(page) { this.p = xobject.deepClone(page); }

  get pageType() {
    switch (this.p.pageType) {
      case 'MASTER': return 'Master';
      case 'NOTES_MASTER': return 'NotesMaster';
      case 'LAYOUT': return 'Layout';
      default: return 'Slide';
    }
  }

  /**
   * Creates requests from a page to use with gapi.slides.presentations.batchUpdate
   * @returns {Array} requests for window.gapi.client.slides.presentations.batchUpdate
   */
  createBatchUpdateRequest() {
    console.log('$$$$>$ Slide', this.p);
    // initialize with create slide request;
    let requests = [
      {
        createSlide: { // https://developers.google.com/slides/reference/rest/v1/presentations/request#CreateSlideRequest
          objectId: this.p.objectId,
          slideLayoutReference: {
            // predefinedLayout: predefinedLayoutName,
          },
          // placeholderIdMappings: [], // https://developers.google.com/slides/reference/rest/v1/presentations/request#LayoutPlaceholderIdMapping
        }
      },
      {
        updatePageProperties: { // https://developers.google.com/slides/reference/rest/v1/presentations/request#UpdatePagePropertiesRequest
          objectId: this.p.objectId,
          pageProperties: this.p.pageProperties,
          fields: Object.keys(this.p.pageProperties).join(','),
        }
      }
    ];

    return requests;
  }
}
