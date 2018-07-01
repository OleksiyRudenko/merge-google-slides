import React, { Component } from 'react';
import {
  Button, Col, Glyphicon, Grid, Panel, Row,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import SourceDeck from "../SourceDeck";
import styles from "./SourceDecks.css";

export default class SourceDecks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      decks: this.props.sourceList,
    };
    bindHandlers(this,
      'renderPanelBody',
      'onMoveLeft',
      'onMoveRight',
    );
  }

  /**
   * Renders component view
   */
  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Glyphicon glyph="th" /> <span>Source decks</span>{' '}
          <Button bsStyle="link"
                  bsSize="small"
                  title="Refresh all"
                  disabled={!this.props.sourceList || !this.props.sourceList.length}
          >
            <Glyphicon glyph="refresh" onClick={this.props.refreshHandler} />
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
        <Grid>
          <Row className={styles.rowFlex}>
            {this.state.decks.map((id, idx) => {
              return (<Col className="col-padding col-min" key={id}>
                <SourceDeck deckId={id}
                            order={idx}
                            moveLeft={idx ? this.onMoveLeft : null}
                            moveRight={idx === this.state.decks.length - 1 ? null : this.onMoveRight}/>
              </Col>);
            })}
          </Row>
        </Grid>
      </Panel.Body>
    );
  }

  /**
   * Called from child component to move deck left
   * @param {number} currentOrderPosition
   * @param {string} deckId
   */
  onMoveLeft(currentOrderPosition, deckId) {
    console.log('SourceDecks.onMoveLeft()', currentOrderPosition, deckId);
    this.props.moveDeckHandler(currentOrderPosition, -1);
  }

  /**
   * Called from child component to move deck right
   * @param {number} currentOrderPosition
   * @param {string} deckId
   */
  onMoveRight(currentOrderPosition, deckId) {
    console.log('SourceDecks.onMoveRight()', currentOrderPosition, deckId);
    this.props.moveDeckHandler(currentOrderPosition, 1);
  }
}
