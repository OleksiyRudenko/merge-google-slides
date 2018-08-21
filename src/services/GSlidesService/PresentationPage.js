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
          // insertionIndex: {Number}, // optional
          slideLayoutReference: { // https://developers.google.com/slides/reference/rest/v1/presentations/request#LayoutReference
            // predefinedLayout: predefinedLayoutName, // or next >>
            layoutId: this.p.slideProperties.layoutObjectId,
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

    // clone .pageElements
    let pageElementsRequests = [];

    this.p.pageElements.forEach((element, idx) => {
      pageElementsRequests = [...pageElementsRequests,
        ...this.createPageElementBatchUpdateRequest(this.p.objectId, element)];
    });
    requests = [...requests, ...pageElementsRequests];

    // clone .notesPage if any -- NB NO method
    /* if (slide.notesPage && slide.notesPage.objectId) {

    } */

    return requests;
  }

  /**
   * Creates requests from a page to use with gapi.slides.presentations.batchUpdate
   * @param {string} slideId
   * @param {Object} pageElement
   * @returns {Array} requests for window.gapi.client.slides.presentations.batchUpdate
   */
  createPageElementBatchUpdateRequest(slideId, pageElement) {
    // TODO: run recurrently for elementGroup
    let requests = [];

    switch (this.getPageElementType(pageElement)) {
      case 'elementGroup':

        break;
      case 'shape':
        requests.push({ // https://developers.google.com/slides/reference/rest/v1/presentations/request#CreateShapeRequest
          createShape: {
            objectId: pageElement.objectId,
            elementProperties: {
              pageObjectId: slideId, // or elId?
              size: pageElement.size,
              transform: pageElement.transform,
            },
            shapeType: pageElement.shape.shapeType,
          }});
        // placeholder
        if (pageElement.shape.text) { // https://developers.google.com/slides/reference/rest/v1/presentations/request#InsertTextRequest
          pageElement.shape.text.textElements.filter(textElement => !!textElement.textRun)
            .forEach(textElement => {
              requests.push({
                insertText: {
                  objectId: pageElement.objectId,
                  // cellLocation: {},
                  text: textElement.textRun.content,
                  insertionIndex: textElement.textRun.endIndex - textElement.textRun.content.length,
                }});
            });
        }
        // updateTextStyle ? updateParagraphStyle ? createParagraphBullets ?
        this.debug && console.log('GSlidesService.createPageElementBatchUpdateRequestFromSource() shapeProperties', pageElement.shape.shapeProperties);
        if (pageElement.shape.shapeProperties) { // https://developers.google.com/slides/reference/rest/v1/presentations/request#UpdateShapePropertiesRequest
          const shapeProperties = pageElement.shape.shapeProperties;
          requests.push({
            updateShapeProperties: {
              objectId: pageElement.objectId,
              shapeProperties: shapeProperties,
              fields: Object.keys(shapeProperties).join(','),
            }});
        }
        break;
      case 'image':
        requests.push({ // https://developers.google.com/slides/reference/rest/v1/presentations/request#CreateImageRequest
          createImage: {
            objectId: pageElement.objectId,
            elementProperties: {
              pageObjectId: slideId, // or elId?
              size: pageElement.size,
              transform: pageElement.transform,
            },
            url: pageElement.image.contentUrl,
          }});
        if (pageElement.image.imageProperties) { // https://developers.google.com/slides/reference/rest/v1/presentations/request#UpdateImagePropertiesRequest
          requests.push({
            updateImageProperties: {
              objectId: pageElement.objectId,
              imageProperties: pageElement.image.imageProperties,
              fields: '*',
            }});
        }
        break;
      case 'table':
        break;
      case 'line':
        break;
      case 'sheetsChart':
        break;
      case 'video':
        requests.push({ // https://developers.google.com/slides/reference/rest/v1/presentations/request#CreateVideoRequest
          createVideo: {
            objectId: pageElement.objectId,
            elementProperties: {
              pageObjectId: slideId, // or elId?
              size: pageElement.size,
              transform: pageElement.transform,
            },
            source: pageElement.video.source,
            id: pageElement.video.id,
          }});
        if (pageElement.title) {
          requests.push({
            updatePageElementAltText: {
              objectId: pageElement.objectId,
              title: pageElement.title,
              description: pageElement.description,
            }});
        }
        if (pageElement.video.videoProperties) { // https://developers.google.com/slides/reference/rest/v1/presentations/request#UpdateVideoPropertiesRequest
          requests.push({
            updateVideoProperties: {
              objectId: pageElement.objectId,
              videoProperties: pageElement.video.videoProperties,
              fields: '*',
            }});
        }
        break;
      default:
        // unsupported pageElementType
        break;
    }

    return requests;
  }

  getPageElementType(pageElement) {
    if (!!pageElement.elementGroup) return 'elementGroup';
    if (!!pageElement.shape) return 'shape';
    if (!!pageElement.line) return 'line';
    if (!!pageElement.image) return 'image';
    if (!!pageElement.table) return 'table';
    if (!!pageElement.sheetsChart) return 'sheetsChart';
    if (!!pageElement.video) return 'video';
    return undefined;
  }
}
