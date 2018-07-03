import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import logoGray from './Works-with-Google-Drive--Gray.png';
import logoWhite from './Works-with-Google-Drive--White.png';

export default class ButtonWorksWithGoogleDrive extends Component {
  /**
   * Renders component view
   */
  render() {
    return (
      <Button bsStyle={this.props.bsStyle || 'link'} bsSize={this.props.bsSize || 'small'} href={this.props.href} target="_blank">
        <img src={this.props.white ? logoWhite : logoGray} alt="Works with Google Drive logo" />
      </Button>
    );
  }
}
