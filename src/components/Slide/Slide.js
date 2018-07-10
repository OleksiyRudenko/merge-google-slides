import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import styles from "./Slide.css";
import SourceDecksService from "../../services/SourceDecksService";
import {bindHandlers} from "../../utils/bind";

export default class Slide extends Component {
  constructor(props) {
    super(props);
    this.debug = true;
    this.state = {
      deckId: this.props.deckId,
      slideId: this.props.slideId,
      slideThumbnailUrl: null,
      isError: false,
      slideLabel: '',
      slideTitle: '',
    };
    bindHandlers(this, 'loadThumbnail', '_makeSlideName');
  }

  /**
   * Update state on first mount
   */
  componentDidMount() {
    this.debug && console.log('Slide.cDM()');
    this.loadThumbnail();
  }

  /**
   * Update state snapshot and derived state properties based on props changed
   */
  componentDidUpdate() {
    this.debug && console.log('Slide.cDU()');
    if (this.props.slideId === null) {
      this.setState({
        deckId: this.props.deckId,
        slideId: this.props.slideId,
        slideThumbnailUrl: null,
        isError: false,
        slideLabel: 'loading thumbnail...',
        slideTitle: 'Loading ' + this._makeSlideName(this.props.deckId, this.props.slideId),
      }, this.loadThumbnail());
    } else {
      if (this.props.deckId !== this.state.deckId || this.props.slideId !== this.state.slideId) {
        this.setState({
          deckId: this.props.deckId,
          slideId: this.props.slideId,
          slideThumbnailUrl: null,
          isError: false,
          slideLabel: 'loading thumbnail...',
          slideTitle: 'Loading ' + this._makeSlideName(this.props.deckId, this.props.slideId),
        }, this.loadThumbnail());
      }
    }
  }

  /**
   * Renders component view
   */
  render() {
    this.debug && console.log('Slide.render()', this.props, this.state);
    return (
      <div className={styles.slidesContainer}>
        {this.state.slideThumbnailUrl
          ? <img className={styles.slideThumbnail}
                 src={this.state.slideThumbnailUrl}
                 alt={this.state.deckId + '#' + this.state.slideId}
                 title={this.state.deckId + '#' + this.state.slideId}
          />
          : <ProgressBar striped
                         bsStyle={this.state.isError ? "danger" : "info"}
                         title={this.state.slideTitle}
                         label={this.state.slideLabel}
                         now={100} active />
        }
      </div>
    );
  }

  /**
   * Load/update thumbnail
   */
  loadThumbnail() {
    this.debug && console.log('Slide.loadThumbnail()', this.props);
    SourceDecksService.getThumbnail(this.props.deckId, this.props.slideId)
      .then(imageUrl => this.setState({
        slideThumbnailUrl: imageUrl,
        isError: false,
        slideLabel: '',
        slideTitle: this._makeSlideName(this.props.deckId, this.props.slideId),
      }))
      .catch(rejection => {
        this.setState({
          slideThumbnailUrl: null,
          isError: true,
          slideLabel: 'Error. Hover for details',
          slideTitle: 'Please, refresh source decks. Couldn\'t load ' + this._makeSlideName(this.props.deckId, this.props.slideId),
        });
        console.error('Slide.loadThumbnail() catch', rejection);
      });
  }

  /**
   * Construct slide name
   * @param {string} deckId
   * @param {string} slideId
   * @returns {string}
   * @private
   */
  _makeSlideName(deckId, slideId) {
    return deckId + '#' + slideId;
  }
}
