import React from 'react';
import RichComponent from "../RichComponent/RichComponent";
import {
  Button, Glyphicon, Panel, ProgressBar,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import Slide from "../Slide";
// import styles from './OutputPreview.css';
import SaveMergedDeck from "../SaveMergedDeck";

export default class OutputPreview extends RichComponent {
  constructor(props) {
    super(props);
    this.debug = false;
    this.state = {
      slideList: this.props.sourceList,
      showSaveDialog: false,
    };
    bindHandlers(this, 'handleSaveDialogClose', 'handleSaveDialogOpen');
    this._debug('.constructor');
  }

  componentDidMount() {
    this._debug('.cDM()');
    // this.loadSlides();
  }

  componentDidUpdate() {
    this._debug('.cDU()');
    /* this.setState({
      slideList: this.props.sourceList,
    }); */
  }

  /* loadSlides() {
    let slideList = [];
    const deckIds = this.state.decks;
    Promise.all(deckIds.map(deckId => SourceDecksService.getSlideIds(deckId)))
      .then(slideIdsList => {
        slideIdsList.forEach((slideIds, idx) => {
          slideIds.forEach(slideId => {
            slideList.push({deckId: deckIds[idx], slideId});
          });
        });
        this.debug && console.log('OutputPreview.loadSlides()', slideList);
        this.setState({slideList});
      });
  } */

  /**
   * Renders component view
   */
  render() {
    this._debug('.render()', this.props, this.state);
    return (
      <Panel className="minimalisticPanel">
        <Panel.Heading>
          <Glyphicon glyph="film" /> <span>Merged</span>{' '}
          <Button bsStyle="link" bsSize="small" title="Save merged to Google Drive"
                  disabled={!this.props.sourceList || !this.props.sourceList.length}
                  onClick={this.handleSaveDialogOpen}>
            <Glyphicon glyph="save" />
          </Button>
        </Panel.Heading>
        <Panel.Body>
          <div  className="minimalisticPanelBody">
          {this.props.sourceList
            ? this.props.sourceList.map((slide, idx) => {
              this._debug('SLIDE', slide);
              return <Slide key={idx} deckId={slide.deckId} slideId={slide.slideId} caller="OUTPUTpreview" />;
            })
            : <ProgressBar striped bsStyle="info" now={100} active /> }
          </div>
        </Panel.Body>
        {this.state.showSaveDialog
          ? <SaveMergedDeck show={this.state.showSaveDialog} handleClose={this.handleSaveDialogClose} />
          : ''}
      </Panel>
    );
  }

  /**
   * Hide Save Merged Deck dialog
   */
  handleSaveDialogClose() {
    this.setState({
      showSaveDialog: false,
    });
  }

  /**
   * Show Save Merged Deck dialog
   */
  handleSaveDialogOpen() {
    this.setState({
      showSaveDialog: true,
    });
  }
}
