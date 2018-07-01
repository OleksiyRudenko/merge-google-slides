import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import styles from "./Slide.css";
import {SourceDecksService} from "../../services/SourceDecksService";
// import {bindHandlers} from "../../utils/bind";

export default class Slide extends Component {
  constructor(props) {
    super(props);
    this.state = {
      deckId: this.props.deckId,
      slideId: this.props.slideId,
      slideThumbnailUrl: null,
    };
    // bindHandlers(this, 'loadThumbnail');
  }

  /**
   * Update state on first mount
   */
  componentDidMount() {
    console.log('Slide.cDM()');
    this.loadThumbnail();
  }

  /**
   * Update state snapshot and derived state properties based on props changed
   */
  componentDidUpdate() {
    console.log('Slide.cDU()');
    if (this.props.deckId !== this.state.deckId || this.props.slideId !== this.state.slideId) {
      this.setState({
        deckId: this.props.deckId,
        slideId: this.props.slideId,
      });
      this.loadThumbnail();
    }
  }

  /**
   * Renders component view
   */
  render() {
    console.log('Slide.render()', this.props, this.state);
    return (
      <div className={styles.slidesContainer}>
        {this.state.slideThumbnailUrl
          ? <img className={styles.slideThumbnail}
                 src={this.state.slideThumbnailUrl}
                 alt={this.props.deckId + '/' + this.props.slideId} />
          : <ProgressBar striped bsStyle="info" label={this.props.slideId} now={100} active />
        }
      </div>
    );
  }

  /**
   * Load/update thumbnail
   */
  loadThumbnail() {
    console.log('Slide.loadThumbnail()');
    SourceDecksService.getThumbnail(this.props.deckId, this.props.slideId)
      .then(imageUrl => this.setState({
        slideThumbnailUrl: imageUrl,
      }));
  }
}
