import React, { Component } from 'react';
import {
  Button, Glyphicon, Panel,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import styles from "./SourceDeck.css";

export default class SourceDeck extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deckId: this.props.deckId,
    };
    bindHandlers(this,
      'renderPanelBody',
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
              <div><span className={styles.ellipsised} title={this.state.deckId}>
                {this.state.deckId}
              </span></div>
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
      </Panel.Body>
    );
  }
}
