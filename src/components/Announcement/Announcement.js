import React, { Component } from 'react';
import { Alert, Button } from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";

export default class Announcement extends Component {
  constructor(props) {
    super(props);
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
        <p><strong>{this.props.title}</strong> {this.props.message}</p>
        <p><Button bsStyle="info" onClick={this.props.action}>{this.props.callToAction}</Button> <Button onClick={this.handleClose}>Dismiss</Button></p>
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
