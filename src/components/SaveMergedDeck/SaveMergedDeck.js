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
        <p className="justified">
          This is still an alpha version of the app. Please, check the <b>Important note</b> on the main page for details.
          Please, come back after July 15, 2018 to check beta version.
        </p>
        <p className="justified"><b>NB!</b> All imported decks will inherit masters, notes master, layouts, page size, and locale from the first deck.
          Therefore the look of decks
          may vary from the original. At the moment of this app development Google Slides API (v.1) didn't offer
          methods to import additional masters, notes master, and layouts. Should the above information be out of date,
          please, submit a <a href="https://goo.gl/forms/G4zwJklIrxOP60ys1" target="_blank" title="Submit a bug report or suggestion" rel="noopener noreferrer">
            <span className="nobreak"><Glyphicon glyph="flash" />suggestion or bug report</span></a>.
        </p>
        {this.state.fileName
          ? <p className="justified">Output will be created as <span className="nobreak"><b><code>{this.state.fileName}</code></b></span> under <a href={`https://drive.google.com/drive/u/0/folders/${this.state.folderId}`} target="_blank" rel="noopener noreferrer">
            <span className="nobreak"><code>{this.state.folderName}</code></span></a> folder.
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
    const deckIds = SourceDecksService.getDeckIds();
    if (deckIds.length) {
      GSlidesService.copyDeck({
        fromDeckId: deckIds.shift(),
        fileName: this.state.fileName,
        parentFolderId: this.state.folderId,
      }).then(file => {
        this.debug && console.log('SaveMergedDeck.handleSave() file', file);
        // merge the remainings decks
        return deckIds.length ? GSlidesService.mergeDecks(file.id, deckIds) : 'Single source deck processed';
      }).then(result => {
        this.debug && console.log('SaveMergedDeck.handleSave() merger result', result);
      }).catch(err => {
        // ERRORS
      });
    }
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
