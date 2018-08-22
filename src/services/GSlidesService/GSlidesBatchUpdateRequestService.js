class GSlidesBatchUpdateRequestService {
  debug = true;
  suffixCounter = 0;

  /**
   * Creates requests from a page to use with gapi.slides.presentations.batchUpdate
   * @param {Object} slide
   * @returns {Array} requests for window.gapi.client.slides.presentations.batchUpdate
   */
  makeFromSlide(slide) {
    this.debug && console.log('GSBURS.makeFromSlide() slide', slide);
    // initialize with create slide request;
    let requests = [
      {
        createSlide: { // https://developers.google.com/slides/reference/rest/v1/presentations/request#CreateSlideRequest
          objectId: slide.objectId,
          // insertionIndex: {Number}, // OPTIONAL
          slideLayoutReference: { // https://developers.google.com/slides/reference/rest/v1/presentations/request#LayoutReference
            // predefinedLayout: predefinedLayoutName, // OR NEXT PROP >>
            layoutId: slide.slideProperties.layoutObjectId,
          },
          // placeholderIdMappings: [], // https://developers.google.com/slides/reference/rest/v1/presentations/request#LayoutPlaceholderIdMapping
        }
      },
      {
        updatePageProperties: { // https://developers.google.com/slides/reference/rest/v1/presentations/request#UpdatePagePropertiesRequest
          objectId: slide.objectId,
          pageProperties: slide.pageProperties,
          fields: Object.keys(slide.pageProperties).join(','),
        }
      }
    ];

    // clone .pageElements
    let pageElementsRequests = [];

    slide.pageElements.forEach((element, idx) => {
      pageElementsRequests = [...pageElementsRequests,
        ...this.makeFromPageElement(slide.objectId, element)];
    });
    requests = [...requests, ...pageElementsRequests];

    // clone .notesPage if any -- NB NO method
    /* if (slide.notesPage && slide.notesPage.objectId) {

    } */

    return requests;
  }

  /**
   * Detects page element type from page element properties
   * @param {Object} pageElement
   * @returns {string|undefined}
   */
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

  /**
   * Creates requests from a page element to use with gapi.slides.presentations.batchUpdate
   * @param {string} parentObjId
   * @param {Object} pageElement
   * @returns {Array} requests for window.gapi.client.slides.presentations.batchUpdate
   */
  makeFromPageElement(parentObjId, pageElement) {
    let requests = [];
    const elementType = this.getPageElementType(pageElement);

    this.debug && console.log('GSBURS.makeFromPageElement() >>> elementType, parentObjId, pageElement >>>', elementType, parentObjId, pageElement);

    switch (elementType) {
      case 'elementGroup':
        const childrenRequests = pageElement.elementGroup.children
          .map(element => this.makeFromPageElement(parentObjId, element))
          .reduce((acc, subarr) => acc.concat(subarr), []); // flatten nested arrays 1 level down
        requests = [...requests, ...childrenRequests];

        const childrenIds = pageElement.elementGroup.children.map(element => element.objectId);
        requests.push({
          groupObjects: {
            groupObjectId: pageElement.objectId, // OPTIONAL
            childrenObjectIds: childrenIds,
          }
        });
        break;
      case 'shape':
        // TODO: placeholder, styles, cell location support
        requests.push({ // https://developers.google.com/slides/reference/rest/v1/presentations/request#CreateShapeRequest
          createShape: {
            objectId: pageElement.objectId,
            elementProperties: {
              pageObjectId: parentObjId,
              size: pageElement.size,
              transform: pageElement.transform,
            },
            shapeType: pageElement.shape.shapeType,
          }});
        if (pageElement.title) {
          requests.push({
            updatePageElementAltText: {
              objectId: pageElement.objectId,
              title: pageElement.title,
              description: pageElement.description,
            }});
        }
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
        this.debug && console.log('GSBURS.makeFromPageElement() shapeProperties', pageElement.shape.shapeProperties);
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
        requests.push({
          createImage: {
            objectId: pageElement.objectId,
            elementProperties: {
              pageObjectId: parentObjId,
              size: pageElement.size,
              transform: pageElement.transform,
            },
            url: pageElement.image.contentUrl,
          }});
        if (pageElement.image.imageProperties) {
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
        requests.push({
          createVideo: {
            objectId: pageElement.objectId,
            elementProperties: {
              pageObjectId: parentObjId,
              size: pageElement.size,
              transform: pageElement.transform,
            },
            source: pageElement.video.source,
            id: pageElement.video.id,
          }});
        if (pageElement.video.videoProperties) {
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

    // Alt Text / Title + Description
    if (pageElement.title) {
      requests.push({
        updatePageElementAltText: {
          objectId: pageElement.objectId,
          title: pageElement.title,
          description: pageElement.description,
        }});
    }

    return requests;
  }

  get nextSuffix() {
    return '-' + this.suffixCounter++;
  }

}

export default new GSlidesBatchUpdateRequestService();

/* implemented API methods
   https://developers.google.com/slides/reference/rest/v1/presentations/request

   Listed as of 2018-08-22

   Legend:
   `?` - status unclear
   `-` - not implemented
   `~` - partially implemented
   `+` - done
   `x` - out of scope

  // SLIDE/PAGE LEVEL
  x "createSlide"
  x "updateSlidesPosition"
  x "updatePageProperties"

  // Page Elements Create/update
  - "createSheetsChart"
  + "createImage"            https://developers.google.com/slides/reference/rest/v1/presentations/request#CreateImageRequest
  + "updateImageProperties"  https://developers.google.com/slides/reference/rest/v1/presentations/request#UpdateImagePropertiesRequest
  + "createVideo"            https://developers.google.com/slides/reference/rest/v1/presentations/request#CreateVideoRequest
  + "updateVideoProperties"  https://developers.google.com/slides/reference/rest/v1/presentations/request#UpdateVideoPropertiesRequest
  - "createLine"
  - "updateLineProperties"

  - "createTable"
  - "insertTableRows"
  - "insertTableColumns"
  - "updateTableBorderProperties"
  - "updateTableColumnProperties"
  - "updateTableRowProperties"
  - "updateTableCellProperties"
  - "mergeTableCells"

  ~ "createShape"
  ~ "updateShapeProperties"

  - "createParagraphBullets"
  - "updateParagraphStyle"

  ~ "insertText"
  ? "updateTextStyle"

  x "updatePageElementTransform"
  + "updatePageElementAltText"  https://developers.google.com/slides/reference/rest/v1/presentations/request#UpdatePageElementAltTextRequest

  + "groupObjects"              https://developers.google.com/slides/reference/rest/v1/presentations/request#GroupObjectsRequest

  // Page Elements Delete
  x "deleteObject"
  x "deleteTableRow"
  x "deleteTableColumn"
  x "deleteText"
  x "deleteParagraphBullets"

  // Page Elements Other
  x "ungroupObjects"
  x "unmergeTableCells"
  x "duplicateObject"
  x "refreshSheetsChart"
  x "replaceAllText"
  x "replaceAllShapesWithImage"
  x "replaceAllShapesWithSheetsChart"
  x "replaceImage"

 */
