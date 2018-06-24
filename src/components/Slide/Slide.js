import React, { Component } from 'react';
import {
  Button, Glyphicon, Panel, ProgressBar
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import styles from "./Slide.css";
import {SourceDecksService} from "../../services/SourceDecksService";

export default class Slide extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slideThumbnail: null,
    };
  }

  /**
   * Renders component view
   */
  render() {
    return (
      <div>
        {this.props.deckId}#{this.props.slideId}
      </div>
    );
  }

}
