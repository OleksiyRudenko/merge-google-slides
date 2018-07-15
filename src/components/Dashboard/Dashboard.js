import React from 'react';
import RichComponent from "../RichComponent";
import queryString from 'qs';
import "./Dashboard.css";
// import SettingsFile from '../SettingsFile';
// import Destination from '../Destination';
// import RenderingOptions from '../RenderingOptions';
import OutputPreview from '../OutputPreview';
import SourceDecks from '../SourceDecks';
import Guide from '../Guide';
import {bindHandlers} from "../../utils/bind";
import SourceDecksService from "../../services/SourceDecksService";

export default class Dashboard extends RichComponent {
  constructor(props) {
    super(props);
    this.debug = false;
    const urlParams = this.props.location.search ? queryString.parse(this.props.location.search.slice(1)) : {state: null};
    this.state = {
      urlParams: urlParams,
      driveState: this.props.gDriveState,
      renderingKey: Math.random(),
      showGuide: false, // !urlParams.state,
      sourceDecksList: null,
      sourceSlidesList: null,
    };
    this.state.sourceDecksList = this.state.driveState ? this.state.driveState.exportIds : [];
    SourceDecksService.setDeckIds(this.state.sourceDecksList);
    bindHandlers(this, 'refreshAll', 'showGuide', 'handleGuideClose',
      'moveDeck', 'deleteDeck', 'loadSlides', 'addDeck', 'onFilesPicked');
    this._debug('.constructor', this.state);
  }

  componentDidMount() {
    this._debug('.cDM() call .loadSlides() having');
    this.loadSlides();
  }

  componentDidUpdate() {
    this._debug('.cDU()');
  }

  /**
   * Renders component view
   */
  render() {
    this._debug('.render()');
    return (
      <React.Fragment>
        {/*<Grid>
          <Row>
            <Tab.Container id="dashboard-settings" defaultActiveKey="settings-file">
              <Row className="clearfix">
                <Col sm={12}>
                  <Nav bsStyle="tabs">
                    <NavItem eventKey="x-collapsed" title="Minimize settings block">
                      <Glyphicon glyph="collapse-up" />
                    </NavItem>
                    <NavItem eventKey="settings-file">
                      <Glyphicon glyph="cog" /> <span className="hidden-xs">Settings file</span>
                    </NavItem>
                    <NavItem eventKey="rendering-options">
                      <Glyphicon glyph="wrench" /> <span className="hidden-xs">Rendering options</span>
                    </NavItem>
                    <NavItem eventKey="destination">
                      <Glyphicon glyph="floppy-save" /> <span className="hidden-xs">Output destination</span>
                    </NavItem>
                  </Nav>
                </Col>
                <Col sm={12}>
                  <Tab.Content animation>
                    <Tab.Pane eventKey="settings-file"><SettingsFile/></Tab.Pane>
                    <Tab.Pane eventKey="rendering-options"><RenderingOptions/></Tab.Pane>
                    <Tab.Pane eventKey="destination"><Destination/></Tab.Pane>
                    <Tab.Pane eventKey="x-collapsed"><Panel><Panel.Body>Click either tab above to expand settings</Panel.Body></Panel></Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </Row>
        </Grid> */}
        <div className="renderBoardContainer">
          <OutputPreview
            sourceList={this.state.sourceSlidesList}
            key={this.state.renderingKey + 1} />
          <SourceDecks sourceList={this.state.sourceDecksList}
                       refreshHandler={this.refreshAll}
                       moveDeckHandler={this.moveDeck}
                       deleteDeckHandler={this.deleteDeck}
                       key={this.state.renderingKey + 2}
                       addDeckHandler={this.addDeck}
          />
        </div>
        {this.showGuide ? <Guide show={this.state.showGuide} handleClose={this.handleGuideClose} /> : ''}
      </React.Fragment>
    );
  }

  /**
   * Clear caches for decks|deck and/or slides thumbnails
   */
  refreshAll() {
    this._debug('.refreshAll()');
    SourceDecksService.clearCache();
    this.setState({
      renderingKey: Math.random(),
    });
  }

  /**
   * Set Welcome component visible
   */
  showGuide() {
    this.setState({
      showGuide: true,
    });
  }

  /**
   * Set Welcome component hidden
   */
  handleGuideClose() {
    this._debug('.handleGuideClose()');
    this.setState({
      showGuide: false,
    });
  }

  /**
   * Move deck in a list
   * @param {Number} currentOrderPosition
   * @param {Number} targetOffset (<0 to the left, >0 to the right)
   */
  moveDeck(currentOrderPosition, targetOffset) {
    this._debug('.moveDeck()', 'currentOrderPosition, targetOffset', currentOrderPosition, targetOffset);
    this._debug('.moveDeck()', 'old list SourceDecksService.getDeckIds()', SourceDecksService.getDeckIds());
    if (SourceDecksService.moveDeckId(currentOrderPosition, targetOffset)) {
      this._debug('.moveDeck()', 'new list SourceDecksService.getDeckIds', SourceDecksService.getDeckIds());
      this.setState({
        sourceDecksList: SourceDecksService.getDeckIds().slice(),
      }, this.loadSlides);
    }
  }

  /**
   * Delete deck from source list
   * @param deckId
   */
  deleteDeck(deckId) {
    SourceDecksService.deleteDeckId(deckId);
    this.setState({
      sourceDecksList: SourceDecksService.getDeckIds().slice(),
    }, this.loadSlides);
  }

  /**
   * Updates source slides list
   */
  loadSlides() {
    this._debug('.loadSlides()');
    const sourceSlidesList = [];
    const deckIds = SourceDecksService.getDeckIds(); // this.state.sourceDecksList;
    this._debug('.loadSlides()', 'deckIds==', deckIds);
    const self = this;
    Promise.all(deckIds.map(deckId => SourceDecksService.getSlideIds(deckId)))
      .then(slideIdsList => {
        slideIdsList.forEach((slideIds, idx) => {
          slideIds.forEach(slideId => {
            sourceSlidesList.push({deckId: deckIds[idx], slideId});
          });
        });
        this._debug('.loadSlides()','sourceSlidesList', sourceSlidesList);
        self.setState({
          sourceSlidesList: sourceSlidesList.slice(),
        }, () => {
          this._debug('.loadSlides()','state updated', this.state);
        });
      });
  }

  /**
   * Add a Slides deck
   */
  addDeck() {
    this._debug('.addDeck()');
    this.props.gapi.createPickerPresentations(this.onFilesPicked);
  }

  /**
   * Process data from google picker
   * @param data
   */
  onFilesPicked(data) {
    this._debug('.onFilesPicked()', '(data)', data);
    if (data[window.google.picker.Response.ACTION] === window.google.picker.Action.PICKED) {
      // https://developers.google.com/picker/docs/
      const docList = data[window.google.picker.Response.DOCUMENTS];
      const docIds = docList
        .filter(doc => doc[window.google.picker.Document.MIME_TYPE] === "application/vnd.google-apps.presentation")
        .map(doc => doc[window.google.picker.Document.ID]);
      // this._debug('.onFilesPicked()', 'data, docIds, window.google.picker.Document', data, docIds, window.google.picker.Document);

      // remove duplicates
      const deckIds = SourceDecksService.getDeckIds();
      const uniqueDocIds = docIds.filter(el => !deckIds.includes(el));
      this._debug('.onFilesPicked()', 'uniqueDocIds', uniqueDocIds);
      if (uniqueDocIds.length) {
        SourceDecksService.appendDeckIds(uniqueDocIds);
        this.setState({
          sourceDecksList: SourceDecksService.getDeckIds().slice(),
        }, this.loadSlides);
      }
    }
  }
}
