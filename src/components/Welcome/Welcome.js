import React, { Component } from 'react';
import {
  Modal, Button, Glyphicon,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";

export default class Welcome extends Component {
  constructor(props) {
    super(props);
    console.log('Welcome.constructor()', this.props);
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
          <Modal.Title>Important notice!</Modal.Title>
        </Modal.Header>
        {this.renderMain()}
        <Modal.Footer>
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
          You must have landed here
          from <a href="https://chrome.google.com/webstore/detail/merge-google-slides/apjijeojdpjochnfenmmkegnifcgfaam" target="_blank" rel="noopener noreferrer">Chrome Web Store</a> or <a href="https://gsuite.google.com/marketplace" target="_blank" rel="noopener noreferrer">
          G Suite Marketplace</a>.
        </p>
        <p className="justified">
          My apologies it is still alpha-version and is publicly available only since otherwise
          I cannot proceed developing it. I expect to offer you an MVP (simple sticking Google Slides
          together) somewhere in late August. More features are to come later. Please, feel free checking
          out <a href="https://github.com/OleksiyRudenko/merge-google-slide" target="_blank" rel="noopener noreferrer">the project on GitHub</a>.
        </p>
        <p className="justified">
          Please, feel free <a href="https://goo.gl/forms/G4zwJklIrxOP60ys1" target="_blank" rel="noopener noreferrer">subscribing for announcements</a> while
          I promise:
        </p>
        <ul>
          <li>not to pass your email address to anyone else;</li>
          <li>not to send anything unrelated to this app;</li>
          <li>stop emailing whenever you tell me to stop.</li>
        </ul>
        <p className="justified">
          Since I gonna send announcements from my private email I shan't send any to addresses
          that have email collectors behind (as I might think so).
        </p>
        <hr/>
        <p>
          As a further excuse...
        </p>
        <p className="justified">
          Some 1.5k corporate users on G Suite Marketplace find my another app <b>Link Manager for Google Drive</b> useful. It simplifies
          generation of auto-export URLs for Native Google Documents and also shortening URLs for any files stored on Google Drive.
        </p>
        <p className="justified">
          Feel free checking it out on <a href="https://gsuite.google.com/marketplace/app/link_manager_for_google_drive_gassa/940998321600" target="_blank" rel="noopener noreferrer">G Suite Marketplace</a> or <a href="https://chrome.google.com/webstore/detail/link-manager-for-google-d/nakhlchefdilapgmhehbpmkgchadojjl" target="_blank" rel="noopener noreferrer">
          Chrome Web Store</a>. You may be required to install
          it from the context of Google Drive:
        </p>
        <p className="justified">
          <Glyphicon glyph="plus"/> <b>New</b> > <b>More</b> > <b><Glyphicon glyph="plus"/> Connect more apps</b> and Search for "<b>Link Manager</b>"
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
