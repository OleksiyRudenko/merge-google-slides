import React, { Component } from 'react';
import {
  Button, Glyphicon, Panel, ProgressBar,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import Slide from "../Slide";
import styles from './OutputPreview.css';
import SaveMergedDeck from "../SaveMergedDeck";

export default class OutputPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slideList: this.props.sourceList,
      showSaveDialog: false,
    };
    bindHandlers(this, 'handleSaveDialogClose', 'handleSaveDialogOpen');
    console.log('OutputPreview.constructor', this.state);
  }

  componentDidMount() {
    // console.log('OutputPreview.cDM()', this.state);
    // this.loadSlides();
  }

  componentDidUpdate() {
    // console.log('OutputPreview.cDU()', this.state);
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
        console.log('OutputPreview.loadSlides()', slideList);
        this.setState({slideList});
      });
  } */

  /**
   * Renders component view
   */
  render() {
    console.log('OutputPreview.render()', this.state);
    return (
      <Panel className={styles.panelMin}>
        <Panel.Heading>
          <Glyphicon glyph="film" /> <span>Merged</span>{' '}
          <Button bsStyle="link" bsSize="small" title="Save merged"
                  disabled={!this.state.slideList}
                  onClick={this.handleSaveDialogOpen}>
            <Glyphicon glyph="save" />
          </Button>
        </Panel.Heading>
        <Panel.Body>
          {this.state.slideList
            ? this.state.slideList.map((slide, idx) => <Slide key={idx} deckId={slide.deckId} slideId={slide.slideId} />)
            : <ProgressBar striped bsStyle="info" now={100} active /> }
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
