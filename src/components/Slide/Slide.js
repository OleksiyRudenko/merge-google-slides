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
      slideThumbnailUrl: undefined,
      isError: false,
      errorMessage: undefined,
    };
    bindHandlers(this, 'loadThumbnail');
  }

  get fullSlideId() { return this.props.deckId + '.' + this.props.slideId; }

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
    if (this.props.slideId === undefined || this.props.deckId !== this.state.deckId || this.props.slideId !== this.state.slideId) {
      this.setState({
        deckId: this.props.deckId,
        slideId: this.props.slideId,
        slideThumbnailUrl: undefined,
        isError: false,
      }, this.loadThumbnail());
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
                 alt='slide thumbnail'
                 title={this.fullSlideId}
          />
          : <ProgressBar striped
                         bsStyle={this.state.isError ? "danger" : "info"}
                         label={this.state.isError ? this.state.errorMessage.short : 'Loading...'}
                         title={this.state.isError ? this.state.errorMessage.full : 'Loading ' + this.fullSlideId}
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
    if (!this.props.deckId || !this.props.slideId) {
      return;
    }
    SourceDecksService.getThumbnail(this.props.deckId, this.props.slideId)
      .then(imageUrl => this.setState({
        slideThumbnailUrl: imageUrl,
        isError: false,
      }))
      .catch(rejection => {
        console.error('Slide.loadThumbnail() catch', rejection);
        this.setState({
          slideThumbnailUrl: undefined,
          isError: true,
          errorMessage: {
            short: 'Error. Hover for details',
            full: 'Please, refresh source decks. Couldn\'t load ' + this.fullSlideId,
          },
        });
      });
  }
}
