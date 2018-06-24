import React, { Component } from 'react';
import {
  Button, Glyphicon, Panel, ProgressBar
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import styles from "./SourceDeck.css";
import {SourceDecksService} from "../../services/SourceDecksService";
import Slide from "../Slide";

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
        console.log('SourceDeck.componentDidMount()', deck);
        this.setState({
          deckTitle: deck.title,
        });
        SourceDecksService.getSlideIds(this.props.deckId).then(slideIds => {
          this.setState({
            slides: slideIds,
          });
        });
      })
      .catch(
      );

  }

  /**
   * Renders component view
   */
  render() {
    return (
      <Panel>
        <Panel.Heading>
          <div className={styles.flexRow}>
            <Glyphicon glyph="film" /> <div className={styles.slidingTextContainer}>
              <div>{this.state.deckTitle ? <span className={styles.ellipsised} title={this.state.deckTitle}>
                {this.state.deckTitle}
              </span> : <ProgressBar striped bsStyle="info" now={100} active />}</div>
            </div> <Button bsStyle="link" bsSize="small" title="Render preview" className={styles.btnSmall}>
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
