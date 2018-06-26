import React, { Component } from 'react';
import { Alert, Button } from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";

export default class Announcement extends Component {
  constructor(props) {
    super(props);
    console.log('Announcement.constructor()', this.props);
    bindHandlers(this,
      'handleClose',
    );
  }

  /**
   * Renders component view
   */
  render() {
    return (
      <Alert bsStyle={this.props.announcementStyle} onDismiss={this.handleClose}>
        <strong>{this.props.title}</strong> {this.props.message}
        {' '}<Button bsStyle="info" onClick={this.props.action}>{this.props.callToAction}</Button> <Button onClick={this.handleClose}>Dismiss</Button>
      </Alert>
    );
  }

  /**
   * Closes the announcement
   */
  handleClose() {
    this.props.handleClose();
  }
}
