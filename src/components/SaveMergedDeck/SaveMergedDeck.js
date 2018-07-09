import React, { Component } from 'react';
import {
  Button, Glyphicon, Modal, ProgressBar
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import GSlidesService from "../../services/GSlidesService";
import SourceDecksService from "../../services/SourceDecksService/SourceDecksService";

export default class SaveMergedDeck extends Component {
  constructor(props) {
    super(props);
    this.debug = true;
    this.debug && console.log('SaveMergedDeck.constructor()', this.props);
    this.state = {
      show: this.props.show,
      fileName: undefined,
      folderName: undefined,
      folderId: undefined,
    };
    bindHandlers(this,
      'renderMain',
      'handleClose',
      'handleSave',
    );
  }

  componentDidMount() {
    this.debug && console.log('SaveMergedDeck.cDM()');
    if (this.state.show && !this.state.fileName) {
      this.updateDestination();
    }
  }

  componentDidUpdate() {
    this.debug && console.log('SaveMergedDeck.cDU()');
    // (this.state.show && this.state.fileName) || this.updateDestination();
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
          <Button bsStyle="primary" disabled={!this.state.fileName} onClick={this.handleSave}><Glyphicon glyph="save" /> Save</Button>
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
        {this.state.fileName
          ? <p>Output will be created as <u><b>{this.state.fileName}</b></u> under <a href={`https://drive.google.com/drive/u/0/folders/${this.state.folderId}`} target="_blank" rel="noopener noreferrer">
            {this.state.folderName}</a> folder.
          </p>
          : <ProgressBar striped bsStyle="info" now={100} active />
        }
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

  updateDestination() {
    GSlidesService.getSuggestedDestination().then(destination => {
      this.debug && console.log('SaveMergedDeck.updateDestination() destination', destination);
      this.state.show && this.setState({
        fileName: destination.filename + ' (' + this.getCurrentDT() + ')',
        folderName: destination.parentFolder.name,
        folderId: destination.parentFolder.id,
      });
    });
  }

  handleSave() {
    this.debug && console.log('SaveMergedDeck.handleSave()');
    GSlidesService.createDeckFromDecks({
      fileName: this.state.fileName,
      parentFolderId: this.state.folderId,
    }, SourceDecksService.getDeckIds()).then(file => {
      this.debug && console.log('SaveMergedDeck.handleSave() resulting file', file);
    }).catch(err => {
      // ERRORS
    });
  }

  getCurrentDT() {
    const d = new Date();
    return [ d.getFullYear(), this.pad(d.getMonth() + 1), this.pad(d.getDate()) ].join('-') +
      ' ' + [this.pad(d.getHours()), this.pad(d.getMinutes()), this.pad(d.getSeconds()) ].join('-');
  }

  pad(str) {
    return str.toString().padStart(2, '0');
  }
}
