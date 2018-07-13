import React from 'react';
import RichComponent from "../RichComponent/RichComponent";
import {
  Button, Glyphicon, Panel, ProgressBar
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import styles from "./SourceDeck.css";
import SourceDecksService from "../../services/SourceDecksService";
import Slide from "../Slide";
import ScrollingText from "../ScrollingText/ScrollingText";

export default class SourceDeck extends RichComponent {
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
    this.renderCount = 5;
    bindHandlers(this,
      'onMoveLeft',
      'onMoveRight',
      'onDeleteDeck',
      '_loadDeckTitleAndSlideIds',
      '_loadSlideIds',
    );
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Store changing props data in state to compare when props change
    // Clear out any previously-loaded user data not to render stale stuff.
    if (nextProps.deckId !== prevState.deckId) {
      console.log('STATIC SourceDeck.getDerivedStateFromProps() .deckId has changed: nextProps, prevState', nextProps, prevState);
      return {
        deckId: nextProps.deckId,     // this is also a flag for whether to load any data
        deckTitle: null,
        slideIds: null, // this is a flag to load data
      };
    }
    // otherwise state update on external update signal not necessary
    return null;
  }

  componentDidMount() {
    this._debug('.cDM()');
    if (!this.state.slideIds && this.state.deckId) {
      this._loadDeckTitleAndSlideIds();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    this._debug('.cDU()', 'prevProps, prevState', prevProps, prevState);
    if (this.renderCount-- && !this.state.slideIds && this.state.deckId && prevProps.deckId !== this.state.deckId) {
      this._loadDeckTitleAndSlideIds();
    }
    if (!this.renderCount) {
      console.error('SourceDeck.cDU() RENDER COUNT THRESHOLD fired (renderCount => 0)');
    }
  }

  componentWillUnmount() {
    this.debug && console.error('SourceDeck.cWU() CANCEL PENDING REQUEST!', this.props, this.state);
  }

  /**
   * Renders component view
   */
  render() {
    this._debug('.render()');
    return (
      <Panel className="minimalisticPanel">
        <Panel.Heading>
          <div className={styles.flexRow}>
            <Glyphicon glyph="film" className={styles.panelIcon} />
            <ScrollingText textData={this.state.deckTitle} idBase={this.state.deckId} />
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
          ? this.state.slideIds.map((slideId, idx) => <Slide key={idx} deckId={this.state.deckId} slideId={slideId} />)
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
    this._debug('_loadDeckTitleAndSlideIds()');
    if (!this.props.deckId) {
      return;
    }
    SourceDecksService.getDeck(this.props.deckId)
      .then(deck => {
        this._debug('._loadDeckTitleAndSlideIds()', 'getDeck.then() with', deck);
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
      this._debug('._loadSlideIds()', '.getSlideIds.then() with', slideIds);
      this.setState({
        slideIds: slideIds,
      });
    })
      .catch(rejection => {
        console.error('SourceDeck._loadSlideIds() ERROR:', rejection);
      });
  }
}
