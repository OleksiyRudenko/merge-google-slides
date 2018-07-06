import React, { Component } from 'react';

export default class ButtonWorksWithGoogleDrive extends Component {
  /**
   * Renders component view
   */
  render() {
    return (
      <a href={this.props.href} target="_blank">
        <img src={`./assets/Works-with-Google-Drive--${this.props.white ? 'White' : 'Gray'}-contracted.png`} alt="Works with Google Drive logo" />
      </a>
    );
  }
}
