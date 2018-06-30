import React, { Component } from 'react';
import {
  Modal, Button, Glyphicon,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";

export default class SaveMergedDeck extends Component {
  constructor(props) {
    super(props);
    console.log('SaveMergedDeck.constructor()', this.props);
    this.state = {
      show: this.props.show,
    };
    bindHandlers(this,
      'renderMain',
      'handleClose',
    );
  }

  /**
   * Renders component view
   */
  render() {
    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title><Glyphicon glyph="save" /> Save resulting deck</Modal.Title>
        </Modal.Header>
        {this.renderMain()}
        <Modal.Footer>
          <Button bsStyle="primary" disabled={true}><Glyphicon glyph="save" /> Save</Button>
          <Button onClick={this.handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  /**
   * Renders panel body
   * @returns {*}
   */
  renderMain() {
    return (
      <Modal.Body>
        <h4>Hi there!</h4>
        <p>
          This is still an alpha version of the app. Please, check the <b>Important note</b> on the main page for details.
          Please, come back after July 15, 2018 to check beta version.
        </p>
      </Modal.Body>
    );
  }

  /**
   * Handle close action
   */
  handleClose() {
    this.setState({
      show: false,
    });
    this.props.handleClose();
  }
}
