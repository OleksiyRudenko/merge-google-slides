class GSlidesService {
  sds;

  constructor() {
    this.debug = true;
  }

  /**
   * Connect SourceDecksService
   * @param SourceDecksService
   */
  init(SourceDecksService) {
    this.sds = SourceDecksService;
  }

  /**
   * Get suggested destination as per first source deck
   * @returns {Promise<{filename: undefined, parentFolder: {id: undefined, name: undefined}}>}
   */
  getSuggestedDestination() {
    const gapi = window.gapi.client;
    const deckIds = this.sds.getDeckIds();
    let destination = {
      filename: undefined,
      parentFolder: {
        id: undefined,
        name: undefined,
      },
    };
    if (!deckIds || !deckIds.length) {
      return Promise.resolve(destination);
    }
    return this.sds.getDeck(deckIds[0]).then(deck => {
      this.debug && console.log('GSlidesService.getSuggestedDestination() deck', deck);
      destination.filename = deck.title;
      return gapi.drive.files.get({
        fileId: deckIds[0],
        fields: 'parents',
      }).then(response => {
        return JSON.parse(response.body);
      }).catch(rejection => {
        console.error('GSlidesService.getSuggestedDestination()::files.get(deckId)', rejection);
        throw new Error(rejection);
      });
    })
      .then(file => {
        this.debug && console.log('GSlidesService.getSuggestedDestination()', file);
        destination.parentFolder.id = file.parents[0];
        return gapi.drive.files.get({
          fileId: destination.parentFolder.id,
        }).then(response => {
          return JSON.parse(response.body);
        }).catch(rejection => {
          console.error('GSlidesService.getSuggestedDestination()::files.get(folderId)', rejection);
          throw new Error(rejection);
        });
      })
      .then(folder => {
        destination.parentFolder.name = folder.name;
        return destination;
      });
  }

  /**
   * Creates new deck with a single default slide
   * @param {Object<{fileName, parentFolderId}>} params
   * @returns {Promise<{fileId:id, kind, mimeType, name}>}
   */
  createDeck(params = {
    fileName: undefined,
    parentFolderId: 'root',
  }) {
    const gapi = window.gapi.client;
    this.debug && console.log("GSlidesService.createDeck()", params);
    if (!params.fileName || !params.parentFolderId) {
      console.error("GSlidesService.createDeck() all params should be defined", params);
      return Promise.reject('GSlidesService.createDeck() all params should be defined');
    }
    return gapi.drive.files.create({resource: {
        "mimeType": "application/vnd.google-apps.presentation",
        "name": params.fileName,
        "parents": [
          params.parentFolderId
        ]
      }
    })
      .then(response => {
        // Handle the results here (response.result has the parsed body).
        this.debug && console.log("GSlidesService.createDeck() result", response.result);
        return response.result;
        })
      .catch(rejection => {
        console.error("GSlidesService.createDeck() error", rejection);
        throw new Error(rejection);
      });
  }

  /**
   * Copies deck.id==fromDeckId into new deck
   * @param {Object<{fromDeckId, fileName, parentFolderId}>} params
   * @returns {Promise<{fileId:id, kind, mimeType, name}>}
   */
  copyDeck(params = {
    fromDeckId: undefined,
    fileName: undefined,
    parentFolderId: 'root',
  }) {
    const gapi = window.gapi.client;
    this.debug && console.log("GSlidesService.copyDeck()", params);
    if (!params.fromDeckId || !params.fileName || !params.parentFolderId) {
      console.error("GSlidesService.copyDeck() all params should be defined", params);
      return Promise.reject('GSlidesService.copyDeck() all params should be defined');
    }
    return gapi.drive.files.copy({
      fileId: params.fromDeckId,
      resource: {
        "mimeType": "application/vnd.google-apps.presentation",
        "name": params.fileName,
        "parents": [
          params.parentFolderId
        ]
      }
    })
      .then(response => {
        // Handle the results here (response.result has the parsed body).
        this.debug && console.log("GSlidesService.copyDeck() result", response.result);
        return response.result;
      })
      .catch(rejection => {
        console.error("GSlidesService.copyDeck() error", rejection);
        throw new Error(rejection);
      });
  }

  /**
   * Load deck
   * @param {string} fileId
   * @returns {Promise} PresentationObject
   */
  loadDeck(fileId) {
    const gapi = window.gapi.client;
    this.debug && console.log("GSlidesService.loadDeck()", fileId);
    return gapi.slides.presentations.get({
      "presentationId": fileId,
      // "fields": "title,slides.objectId",
    })
      .then(response => {
        this.debug && console.log("GSlidesService.loadDeck() result", response.result);
        return response.result;
      });

  }

  /**
   * Merges slides.id==[sourceIds] into slides.id==targetId with progress reporting
   * @param {string} targetId Slides deck to merge source Slides decks into
   * @param {Array<string>} sourceIds source Slides decks ids
   * @param {Object} cb reporting callbacks
   * @returns {Promise} response.result from gapi.slides.presentations.batchUpdate
   */
  mergeDecks(targetId, sourceIds = [], cb = {
    reportPhase: undefined,
    reportJobsCountToComplete: undefined,
    reportJobsCountCompleted: undefined,
  }) {
    const gapi = window.gapi.client;
    this.debug && console.log("GSlidesService.mergeDecks()", targetId, sourceIds);

    cb.reportPhase && cb.reportPhase({phaseNo: 0, message: 'Started'});
    return this.loadDeck(targetId).then(targetDeck => {
      cb.reportPhase && cb.reportPhase({phaseNo: 11, message: 'Target deck loaded'});
      return Promise.all(sourceIds.map(id => this.loadDeck(id))).then(results=> {
        cb.reportPhase && cb.reportPhase({phaseNo: 12, message: 'Source decks loaded'});
        return {
          targetDeck,
          sourceDecks: results,
        };
      });
    })
      .then(decks => {
        let requests = [];
        let sourceDecksObjectsCount;
        cb.reportPhase && cb.reportPhase({phaseNo: 20, message: 'Convert source decks into merger instructions'});
        // TODO: count and report via cb.reportJobsCountToComplete a number of objects to process
        if (cb.reportJobsCountToComplete) {
          sourceDecksObjectsCount = this.countSlideObjects(decks.sourceDecks);
          cb.reportJobsCountToComplete(sourceDecksObjectsCount);
        }
        // map targetDeck masters, noteMaster, and layouts ids
        const targetDeckIdsMap = this.mapDeckMastersNotesMasterLayoutsIds(decks.targetDeck);
        // fill requests per each decks.sourceDecks
        decks.sourceDecks.forEach((deck, idx) => {
          requests = [...requests, ...this.createSlidesBatchUpdateRequestsFromDeck(deck, 'mgs' + idx, targetDeckIdsMap, cb.reportJobsCountCompleted)];
        });
        cb.reportPhase && cb.reportPhase({phaseNo: 29, message: 'Source decks merger instructions composed'});

        cb.reportPhase && cb.reportPhase({phaseNo: 30, message: 'Merger execution started'});
        this.debug && console.log("GSlidesService.mergeDecks() batchUpdate with requests", requests);
        return gapi.slides.presentations.batchUpdate({
          "presentationId": decks.targetDeck.presentationId,
          "resource": {
            "requests": requests,
            "writeControl": {
              "requiredRevisionId": decks.targetDeck.revisionId,
            }
          }
        });
      })
      .then(response => {
        this.debug && console.log("GSlidesService.mergeDecks()", response.result);
        cb.reportPhase && cb.reportPhase({phaseNo: 39, message: 'Merger execution completed'});
        cb.reportPhase && cb.reportPhase({phaseNo: 99, message: 'All done'});
        return response.result;
      })
      .catch(rejection => {
        console.log("GSlidesService.mergeDecks()", rejection);
        cb.reportPhase && cb.reportPhase({phaseNo: 111, message: 'Merger failed', error: rejection});
        throw new Error(rejection);
      });
  }

  /**
   * Counts number of objects (slides and slides child objects in decks
   * @param {Array<Object>} decks
   * @returns {number}
   */
  countSlideObjects(decks) {
    this.debug && console.log("GSlidesService.countSlideObjects() for", decks);
    return 1;
  }

  /**
   * Maps deck masters, notes master, layouts ids
   * @param {Object} deck to parse
   * @returns {Object} map
   */
  mapDeckMastersNotesMasterLayoutsIds(deck) {
    let map = {
      master: {
        objectId: deck.masters[0].objectId,
      },
      notesMaster: {
        "n:slide": "n:slide",
        "n:text": "n:text",
      },
      layouts: {
        // layout ENUM name: objectId
      },
      uniform: {
        "n:slide": "n:slide",
        "n:text": "n:text",
      },
    };
    // parse layouts
    deck.layouts.forEach(layout => {
      map.layouts[layout.layoutProperties.name] = layout.objectId;
    });

    return map;
  }

  /**
   * Creates requests from a deck to use with gapi.slides.presentations.batchUpdate
   * @param {Object} deck representation
   * @param {string} idPrefix used to build unique ids
   * @param {Object} targetIdsMap map of targetDeck masters, notes master, and layout objects
   * @param {callback} cbReportJobsCountCompleted called with count of jobs completed
   * @returns {Array} requests for window.gapi.client.slides.presentations.batchUpdate
   */
  createSlidesBatchUpdateRequestsFromDeck(deck, idPrefix, targetIdsMap, cbReportJobsCountCompleted) {
    this.debug && console.log("GSlidesService.createSlidesBatchUpdateRequestsFromDeck() deck, idPrefix, targetIdsMap", deck, idPrefix, targetIdsMap);
      // Convert deck.slides[]:
      //    slides[] - pageType=undefined; completes idMap; requires idMap for
      //      .slideProperties.layoutObjectId|masterObjectId
      //    slide.pageElements[] - completes idMap; requires no idMap
      //    slide.slideProperties.notesPage - pageType="NOTES", completes idMap; requires idMap for
      //      .notesProperties.speakerNotesObjectId (from under slide.slideProperties.pageElements[])

    let requests = [];
    let idMap = {}; // will contain slide and slides' page elements ids for interslide cross-reference
    const predefinedLayoutsMap = {};
    deck.layouts.forEach(layout => { predefinedLayoutsMap[layout.objectId] = layout.layoutProperties.name || 'BLANK' });

    deck.slides.forEach((slide, idx) => {
      requests = [...requests, ...this.createBatchUpdateRequestsFromSlide(slide,
        predefinedLayoutsMap[slide.slideProperties.layoutObjectId],
        idPrefix + 's' + idx,
        targetIdsMap,
        idMap,
        cbReportJobsCountCompleted)];
    });

    return requests;
  }

  /**
   * Creates requests from a slide to use with gapi.slides.presentations.batchUpdate
   * @param {Object} slide representation
   * @param {string} predefinedLayoutName
   * @param {string} slideId used also to build unique ids
   * @param {Object} targetIdsMap map of targetDeck masters, notes master, and layout objects from target deck
   * @param {Object} idMap map of slides ids and slides' pageElements ids for interslide reference within current deck
   * @param {callback} cbReportJobsCountCompleted called with count of jobs completed
   * @returns {Array} requests for window.gapi.client.slides.presentations.batchUpdate
   */
 createBatchUpdateRequestsFromSlide(slide, predefinedLayoutName, slideId, targetIdsMap, idMap, cbReportJobsCountCompleted) {
    this.debug && console.log("GSlidesService.createBatchUpdateRequestsFromSlide() slide, new id, targetIdsMap, currentDeckSlideIdsMap",
      slide, slideId, targetIdsMap, idMap);
    idMap[slide.objectId] = slideId;

    // initialize with create slide request;
    let requests = [
      {
        createSlide: { // https://developers.google.com/slides/reference/rest/v1/presentations/request#CreateSlideRequest
          objectId: slideId,
          slideLayoutReference: {
            predefinedLayout: predefinedLayoutName,
          },
          // placeholderIdMappings: [], // https://developers.google.com/slides/reference/rest/v1/presentations/request#LayoutPlaceholderIdMapping
        }
      },
      {
        updatePageProperties: { // https://developers.google.com/slides/reference/rest/v1/presentations/request#UpdatePagePropertiesRequest
          objectId: slideId,
          pageProperties: slide.pageProperties,
          fields: Object.keys(slide.pageProperties).join(','),
        }
      }
    ];

    // clone .pageElements
    let pageElementsRequests = [];
    let pageElementsMap = {};
    slide.pageElements.forEach((element, idx) => {
      pageElementsMap[element.objectId] = slideId + 'e' + idx;
      idMap[element.objectId] = slideId + 'e' + idx;
    });

    slide.pageElements.forEach((element, idx) => {
      pageElementsRequests = [...pageElementsRequests,
        ...this.createPageElementBatchUpdateRequestFromSource(slideId, element, pageElementsMap[element.objectId], idMap)];
    });
    requests = [...requests, ...pageElementsRequests];

    // clone .notesPage if any -- NB NO method
    /* if (slide.notesPage && slide.notesPage.objectId) {

    } */

    // report slide pageElements + 1 for slide itself + 1 for notesPage
    cbReportJobsCountCompleted && cbReportJobsCountCompleted(slide.pageElements.length + 1 + (slide.notesPage && slide.notesPage.objectId ? 1 : 0));

    return requests;
 }

  /**
   * Creates requests to reproduce pageElement from source
   * @param {string} slideId parent slide id
   * @param {Object} pageElement
   * @param {string} peId
   * @param {Object} idMap
   * @returns {Array} requests
   */
  createPageElementBatchUpdateRequestFromSource(slideId, pageElement, peId, idMap) {
    // TODO: run recurrently for elementGroup
    let requests = [];

    switch (this.getPageElementType(pageElement)) {
      case 'elementGroup':

        break;
      case 'shape':
        requests.push({ // https://developers.google.com/slides/reference/rest/v1/presentations/request#CreateShapeRequest
          createShape: {
            objectId: peId,
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
                  objectId: peId,
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
              objectId: peId,
              shapeProperties: shapeProperties,
              fields: Object.keys(shapeProperties).join(','),
            }});
        }
        break;
      case 'image':
        requests.push({ // https://developers.google.com/slides/reference/rest/v1/presentations/request#CreateImageRequest
          createImage: {
            objectId: peId,
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
              objectId: peId,
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
            objectId: peId,
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
              objectId: peId,
              title: pageElement.title,
              description: pageElement.description,
            }});
        }
        if (pageElement.video.videoProperties) { // https://developers.google.com/slides/reference/rest/v1/presentations/request#UpdateVideoPropertiesRequest
          requests.push({
            updateVideoProperties: {
              objectId: peId,
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

  createFieldsMask(props) {

  }

  /**
   * Removes property where property.propertyState == <any>
   * @param properties
   * @returns {Object}
   */
  removeInheritedProperties(properties) {
    let resultingObject = {};
    Object.keys(properties).forEach(property => {
      if (!property.propertyState) {
        resultingObject[property] = properties[property];
      }
    });
    return resultingObject;
  }


 // ==== Deprecated as other page types (masters, note master, layout) cannot be imported with Slides API v.1

 /**
  * Creates requests from a deck to use with gapi.slides.presentations.batchUpdate
  * @param {Object} deck representation
  * @param {string} idPrefix used to build unique ids
  * @param {callback} cbReportJobsCountCompleted called with count of jobs completed
  * @returns {Array} requests for window.gapi.client.slides.presentations.batchUpdate
  */
   /* createBatchUpdateRequestsFromDeck(deck, idPrefix, cbReportJobsCountCompleted) {
    let pageElementsCount = 0;
    this.debug && console.log("GSlidesService.createBatchUpdateRequestsFromDeck()", deck);
     // Convert pages deck:
     //    masters[] - pageType="MASTER"; completes idMap; requires no idMap
     //    notesMaster - pageType="NOTES_MASTER"; completes idMap; requires no idMap
     //    layouts[] - pageType="LAYOUT"; completes idMap; requires idMap for .layoutProperties.masterObjectId
     //    slides[] - pageType=undefined; completes idMap; requires idMap for
     //      .slideProperties.layoutObjectId|masterObjectId
     //    slide.pageElements[] - completes idMap; requires no idMap
     //    slide.slideProperties.notesPage - pageType="NOTES", completes idMap; requires idMap for
     //      .notesProperties.speakerNotesObjectId (from under slide.slideProperties.pageElements[])
     //   Every item above exposes objectId or objectId per each element in array

    let requests = [];
    let idMap = {};

    requests = [...requests, ...this.createBatchUpdateRequestsFromPage(deck.notesMaster, idPrefix + 'NM', idMap, cbReportJobsCountCompleted)];

    return requests;
  } */

  /**
   * Creates requests from a page to use with gapi.slides.presentations.batchUpdate
   * @param {Object} sourcePage representation
   * @param {string} id page id, also used to build unique ids for children
   * @param {Object} idMap to use for id mapping or to complete
   * @param {callback} cbReportJobsCountCompleted called with count of jobs completed
   * @returns {Array} requests for window.gapi.client.slides.presentations.batchUpdate
   */
  /* createBatchUpdateRequestsFromPage(sourcePage, id, idMap, cbReportJobsCountCompleted) {
    idMap[sourcePage.objectId] = id;

    // reproduce a page itself
    let requests = [{

    }];

    cbReportJobsCountCompleted && cbReportJobsCountCompleted(1); // report this job done

    // reproduce pageElements if any

    return requests;
  } */
}

export default new GSlidesService();
