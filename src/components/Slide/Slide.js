import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import styles from "./Slide.css";
import SourceDecksService from "../../services/SourceDecksService";

export default class Slide extends Component {
  static defaultProps = {
    deckId: null,
    slideId: null,
  };

  constructor(props) {
    super(props);
    this.debug = true;
    this.state = {
      deckId: this.props.deckId,
      slideId: this.props.slideId,
      slideThumbnailUrl: null,
      isError: false,
      errorMessage: null,
    };
  }

  get fullSlideId() { return this.props.deckId + '.' + this.props.slideId; }

  static getDerivedStateFromProps(nextProps, prevState) {
    // Store changing props data in state to compare when props change
    // Clear out any previously-loaded user data not to render stale stuff.
    if (nextProps.deckId !== prevState.deckId) {
      return {
        deckId: nextProps.deckId,     // this is also a flag for whether to load any data
        slideId: nextProps.slideId,
        slideThumbnailUrl: null, // this is a flag to load data
        isError: false,
        errorMessage: null,
      };
    }
    // otherwise state update on external update signal not necessary
    return null;
  }

  /**
   * Update state on first mount
   */
  componentDidMount() {
    this.debug && console.log('Slide.cDM()');
    // load external data first time upon mounting
    this._loadThumbnail();
  }

  /**
   * Update state snapshot and derived state properties based on props changed
   */
  componentDidUpdate(prevProps, prevState) {
    this.debug && console.log('Slide.cDU(), prevProps, props, prevState, state', prevProps, this.props, prevState, this.state);
    if (this.state.slideThumbnailUrl === null && this.state.deckId && this.state.slideId) {
      // we're in commit phase, safe to load new data provided conditions are met
      this._loadThumbnail();
    }
  }

  componentWillUnmount() {
    this.debug && console.error('Slide.cWU() CANCEL PENDING REQUEST!', this.props, this.state);
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
  _loadThumbnail() {
    this.debug && console.log('Slide._loadThumbnail()', this.props);
    if (!this.props.deckId || !this.props.slideId) {
      return;
    }
    // cancel any pending requests for the same resource from the same unique source!
    // const requestId = componentInstance + deckId + slideId

    SourceDecksService.getThumbnail(this.props.deckId, this.props.slideId)
      .then(imageUrl => this.setState({
        slideThumbnailUrl: imageUrl,
        isError: false,
      }))
      .catch(rejection => {
        console.error('Slide._loadThumbnail() catch', rejection);
        this.setState({
          slideThumbnailUrl: null,
          isError: true,
          errorMessage: {
            short: 'Error. Hover for details',
            full: 'Please, refresh source decks. Couldn\'t load ' + this.fullSlideId,
          },
        });
      });
  }
}
