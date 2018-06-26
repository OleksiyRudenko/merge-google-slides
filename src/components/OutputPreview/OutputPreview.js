import React, { Component } from 'react';
import {
  Button, Glyphicon, Panel, ProgressBar,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import {SourceDecksService} from "../../services/SourceDecksService";
import Slide from "../Slide";
// import styles from './OutputPreview.css';

export default class OutputPreview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slideList: null,
    };
    bindHandlers(this,
      'renderPanelBody',
    );
  }

  componentDidMount() {
    let slideList = [];
    const deckIds = SourceDecksService.getDeckIds();
    Promise.all(deckIds.map(deckId => SourceDecksService.getSlideIds(deckId)))
      .then(slideIdsList => {
        slideIdsList.forEach((slideIds, idx) => {
          slideIds.forEach(slideId => {
            slideList.push({deckId: deckIds[idx], slideId});
          });
        });
        console.log('OutputPreview.componentDidMount()', slideList);
        this.setState({slideList});
      });
  }

  /**
   * Renders component view
   */
  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Glyphicon glyph="film" /> <span className="hidden-xs">Preview</span>{' '}
          <Button bsStyle="link" bsSize="small" title="Render preview">
            <Glyphicon glyph="play" />
          </Button>
        </Panel.Heading>
        { this.renderPanelBody() }
      </Panel>
    );
  }

  /**
   * Renders panel body
   * @returns {*}
   */
  renderPanelBody() {
    return (
      <Panel.Body>
        {this.state.slideList
          ? this.state.slideList.map((slide, idx) => <Slide key={idx} deckId={slide.deckId} slideId={slide.slideId} />)
          : <ProgressBar striped bsStyle="info" now={100} active /> }
      </Panel.Body>
    );
  }

}
