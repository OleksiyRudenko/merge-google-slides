import React, { Component } from 'react';
import {
  Button, Glyphicon, Panel, ProgressBar,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import Slide from "../Slide";
// import styles from './OutputPreview.css';
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
    console.log('OutputPreview.cDM()', this.props, this.state);
    // this.loadSlides();
  }

  componentDidUpdate() {
    console.log('OutputPreview.cDU()', this.props, this.state);
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
        console.log('OutputPreview.loadSlides()', slideList);
        this.setState({slideList});
      });
  } */

  /**
   * Renders component view
   */
  render() {
    console.log('OutputPreview.render()', this.props, this.state);
    return (
      <Panel className="minimalisticPanel">
        <Panel.Heading>
          <Glyphicon glyph="film" /> <span>Merged</span>{' '}
          <Button bsStyle="link" bsSize="small" title="Save merged"
                  disabled={!this.props.sourceList || !this.props.sourceList.length}
                  onClick={this.handleSaveDialogOpen}>
            <Glyphicon glyph="save" />
          </Button>
        </Panel.Heading>
        <Panel.Body>
          <div  className="minimalisticPanelBody">
          {this.props.sourceList
            ? this.props.sourceList.map((slide, idx) => {
              console.log(slide);
              return <Slide key={idx} deckId={slide.deckId} slideId={slide.slideId} />;
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
