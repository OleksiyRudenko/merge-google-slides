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
   * @param {Object<{fileName, ParentFolderId}>} params
   * @returns {Promise<{fileId:id, kind, mimeType, name}>}
   */
  createDeck(params = {
    fileName: undefined,
    parentFolderId: undefined,
  }) {
    const gapi = window.gapi.client;
    this.debug && console.log("GSlidesService.createDeck()", params);
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

  mergeDecks(targetId, sourceIds = []) {
    const gapi = window.gapi.client;
    this.debug && console.log("GSlidesService.mergeDecks()", targetId, sourceIds);

    return this.loadDeck(targetId).then(targetDeck => {
      return Promise.all(sourceIds.map(id => this.loadDeck(id))).then(results=> {
        return {
          targetDeck,
          sourceDecks: results,
        };
      });
    })
      .then(decks => {
        let requests = [];
        // fill requests per each decks.sourceDecks
        decks.sourceDecks.forEach((deck, idx) => {
          requests = [...requests, ...this.createBatchUpdateRequestsFromSlides(deck, idx)];
        });

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
        return response.result;
      })
      .catch(rejection => {
        console.log("GSlidesService.mergeDecks()", rejection);
        throw new Error(rejection);
      });
  }

  /**
   * Creates requests from a deck to use with gapi.slides.presentations.batchUpdate
   * @param {Object} deck representation
   * @param {Number} idx used to build unique ids
   * @returns {Array}
   */
  createBatchUpdateRequestsFromSlides(deck, idx) {
    const idPrefix = 'mgs' + idx;
    let pageElementsCount = 0;


  }

}

export default new GSlidesService();
