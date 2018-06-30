import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import styles from "./Slide.css";
import {SourceDecksService} from "../../services/SourceDecksService";

export default class Slide extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slideThumbnailUrl: null,
    };
  }

  componentDidMount() {
    SourceDecksService.getThumbnail(this.props.deckId, this.props.slideId)
      .then(imageUrl => this.setState({
        slideThumbnailUrl: imageUrl,
      }));
  }

  /**
   * Renders component view
   */
  render() {
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

}
