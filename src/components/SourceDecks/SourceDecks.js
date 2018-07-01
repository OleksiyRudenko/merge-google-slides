import React, { Component } from 'react';
import {
  Button, Glyphicon, Panel,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import SourceDeck from "../SourceDeck";
// import "./SourceDecks.css";

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
      'addDeck',
      'deleteDeck',
    );
  }

  /**
   * Renders component view
   */
  render() {
    return (
      <Panel className="fillingPanel">
        <Panel.Heading>
          <Glyphicon glyph="th" /> <span>Source decks</span>{' '}
          <Button bsStyle="link"
                  bsSize="small"
                  title="Add Slides deck"
                  onClick={this.addDeck}
          >
            <Glyphicon glyph="plus" />
          </Button>
          <Button bsStyle="link"
                  bsSize="small"
                  title="Refresh all"
                  onClick={this.props.refreshHandler}
                  disabled={!this.props.sourceList || !this.props.sourceList.length}
          >
            <Glyphicon glyph="refresh" />
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
      <Panel.Body className="fillingPanelBody">
           {this.props.sourceList.map((id, idx) => {
              return (
                <SourceDeck deckId={id}
                            order={idx}
                            moveLeft={idx ? this.onMoveLeft : null}
                            moveRight={idx === this.state.decks.length - 1 ? null : this.onMoveRight}
                            deleteDeck={this.deleteDeck}
                />
              );
            })}
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

  /**
   * Add a deck to the list
   */
  addDeck() {
    console.log('SourceDeck.addDeck()');
    this.props.addDeckHandler();
  }

  /**
   * Delete a deck
   */
  deleteDeck(deckId) {
    console.log('SourceDeck.deleteDeck()');
    this.props.deleteDeckHandler(deckId);
  }
}
