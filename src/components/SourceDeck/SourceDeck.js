import React, { Component } from 'react';
import {
  Button, Glyphicon, Panel, ProgressBar
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import styles from "./SourceDeck.css";
import {SourceDecksService} from "../../services/SourceDecksService";
import Slide from "../Slide";
import ScrollingText from "../ScrollingText/ScrollingText";

export default class SourceDeck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deckTitle: null,
      slides: null,
    };
    bindHandlers(this,
      'renderPanelBody',
    );
  }

  componentDidMount() {
    SourceDecksService.getDeck(this.props.deckId)
      .then(deck => {
        console.log('SourceDeck.componentDidMount() getDeck.then()', deck);
        this.setState({
          deckTitle: deck.title,
        });
        SourceDecksService.getSlideIds(this.props.deckId).then(slideIds => {
          console.log('SourceDeck.componentDidMount() .getSlideIds.then()', slideIds);
          this.setState({
            slides: slideIds,
          });
        });
      })
      .catch(rejection => {
        console.error('SourceDeck.componentDidMount() error ', rejection);
      });
  }

  /**
   * Renders component view
   */
  render() {
    console.log('SourceDeck.render()', this.state);
    return (
      <Panel className={styles.panelMin}>
        <Panel.Heading>
          <div className={styles.flexRow}>
            <Glyphicon glyph="film" className={styles.panelIcon} />
            <ScrollingText textData={this.state.deckTitle} idBase={this.props.deckId} />
            <Button bsStyle="link" bsSize="small" title="Render preview" className={styles.btnSmall}>
              <Glyphicon glyph="play" />
            </Button>
          </div>
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
        {this.state.slides
          ? this.state.slides.map((slideId, idx) => <Slide key={idx} deckId={this.props.deckId} slideId={slideId} />)
          : 'Loading...'
        }
      </Panel.Body>
    );
  }
}
