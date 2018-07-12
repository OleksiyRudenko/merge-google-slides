import React, { Component } from 'react';
import {
  Button, Glyphicon, Panel, ProgressBar
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import styles from "./SourceDeck.css";
import SourceDecksService from "../../services/SourceDecksService";
import Slide from "../Slide";
import ScrollingText from "../ScrollingText/ScrollingText";

export default class SourceDeck extends Component {
  static defaultProps = {
    deckId: null,
    order: null,
    moveLeft: null,
    moveRight: null,
    deleteDeck: null,
  };

  constructor(props) {
    super(props);
    this.debug = true;
    this.state = {
      deckId: this.props.deckId,
      deckTitle: null,
      slideIds: null,
    };
    bindHandlers(this,
      'onMoveLeft',
      'onMoveRight',
      'onDeleteDeck',
      '_loadSlideIds',
    );
  }

  componentDidMount() {
    this.debug && console.log('SourceDeck.cDM()', this.props);
    this._loadDeckTitleAndSlideIds();
  }

  componentDidUpdate(prevProps, prevState) {
    this.debug && console.log('SourceDeck.cDU()', this.props);
    if (this.props.deckId !== this.state.deckId) {
      this.setState({
        deckId: this.props.deckId,
        deckTitle: null,
        slideIds: null,
      }, this._loadDeckTitleAndSlideIds);
    }
  }

  /**
   * Renders component view
   */
  render() {
    this.debug && console.log('SourceDeck.render()', this.state);
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
        {this.state.slideIds
          ? this.state.slideIds.map((slideId, idx) => <Slide key={idx} deckId={this.props.deckId} slideId={slideId} />)
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

  /**
   * Load deck title and slide ids based on .this.props.deckId
   * @private
   */
  _loadDeckTitleAndSlideIds() {
    if (!this.props.deckId) {
      return;
    }
    SourceDecksService.getDeck(this.props.deckId)
      .then(deck => {
        this.debug && console.log('SourceDeck._loadDeckTitleAndSlideIds() getDeck.then() with', deck);
        this.setState({
          deckTitle: deck.title,
          slideIds: null,
        }, this._loadSlideIds);
      })
      .catch(rejection => {
        console.error('SourceDeck._loadDeckTitleAndSlideIds() ERROR:', rejection);
      });
  }

  /**
   * Load deck slide ids
   * @private
   */
  _loadSlideIds() {
    SourceDecksService.getSlideIds(this.props.deckId).then(slideIds => {
      this.debug && console.log('SourceDeck._loadSlideIds() .getSlideIds.then() with', slideIds);
      this.setState({
        slideIds: slideIds,
      });
    })
      .catch(rejection => {
        console.error('SourceDeck._loadSlideIds() ERROR:', rejection);
      });
  }
}
