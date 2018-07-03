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
      deckId: this.props.deckId,
      deckTitle: null,
      slides: null,
    };
    bindHandlers(this,
      'renderPanelBody',
      'onMoveLeft',
      'onMoveRight',
      'onDeleteDeck',
    );
  }

  componentDidMount() {
    SourceDecksService.getDeck(this.props.deckId)
      .then(deck => {
        // console.log('SourceDeck.componentDidMount() getDeck.then()', deck);
        this.setState({
          deckTitle: deck.title,
        });
        SourceDecksService.getSlideIds(this.props.deckId).then(slideIds => {
          // console.log('SourceDeck.componentDidMount() .getSlideIds.then()', slideIds);
          this.setState({
            slides: slideIds,
          });
        });
      })
      .catch(rejection => {
        console.error('SourceDeck.componentDidMount() error ', rejection);
      });
  }

  componentDidUpdate() {
    if (this.props.deckId !== this.state.deckId) {
      this.setState({
        deckId: this.props.deckId,
        deckTitle: null,
        slides: null,
      });
      SourceDecksService.getDeck(this.props.deckId)
        .then(deck => {
          // console.log('SourceDeck.componentDidMount() getDeck.then()', deck);
          this.setState({
            deckTitle: deck.title,
          });
          SourceDecksService.getSlideIds(this.props.deckId).then(slideIds => {
            // console.log('SourceDeck.componentDidMount() .getSlideIds.then()', slideIds);
            this.setState({
              slides: slideIds,
            });
          });
        })
        .catch(rejection => {
          console.error('SourceDeck.componentDidMount() error ', rejection);
        });
    }
  }

  /**
   * Renders component view
   */
  render() {
    // console.log('SourceDeck.render()', this.state);
    return (
      <Panel className="minimalisticPanel">
        <Panel.Heading>
          <div className={styles.flexRow}>
            <Glyphicon glyph="film" className={styles.panelIcon} />
            <ScrollingText textData={this.state.deckTitle} idBase={this.props.deckId} />
            <Button bsStyle="link" bsSize="small" title="Move left" className={styles.btnSmall}
                    disabled={!this.props.moveLeft}
                    onClick={this.onMoveLeft}>
              <Glyphicon glyph="triangle-left" />
            </Button>
            <Button bsStyle="link" bsSize="small" title="Remove deck" className={styles.btnSmall}
                    disabled={!this.props.deleteDeck}
                    onClick={this.onDeleteDeck}>
              <Glyphicon glyph="trash" />
            </Button>
            <Button bsStyle="link" bsSize="small" title="Move right" className={styles.btnSmall}
                    disabled={!this.props.moveRight}
                    onClick={this.onMoveRight}>
              <Glyphicon glyph="triangle-right" />
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
          : <ProgressBar striped bsStyle="info" now={100} active />
        }
      </Panel.Body>
    );
  }

  /**
   * Handle Move Left button click
   */
  onMoveLeft() {
    if (this.props.moveLeft) {
      this.props.moveLeft(this.props.order, this.props.deckId);
    }
  }

  /**
   * Handle Move Right button click
   */
  onMoveRight() {
    if (this.props.moveRight) {
      this.props.moveRight(this.props.order, this.props.deckId);
    }
  }

  /**
   * Handle Delete deck button click
   */
  onDeleteDeck() {
    if (this.props.deleteDeck) {
      this.props.deleteDeck(this.props.deckId);
    }
  }
}
