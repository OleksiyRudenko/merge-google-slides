class GSlidesService {
  gapi;
  sds;

  constructor() {
    this.gapi = window.gapi;
  }

  /**
   * Connect SourceDecksService
   * @param SourceDecksService
   */
  init(SourceDecksService) {
    this.sds = SourceDecksService;
  }

  getSuggestedDestination() {
    const deckIds = this.sds.getDeckIds();
    let destination = {
      filename: undefined,
      parentFolder: {
        id: undefined,
        name: undefined,
      },
    };
    if (!deckIds || !deckIds.length) {
      return destination;
    }

    return destination;
  }

}

export default new GSlidesService();
