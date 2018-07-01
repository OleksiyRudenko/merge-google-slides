import React, { Component } from 'react';
import { Button, Image, Modal, } from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import styles from './UserProfile.css';

export default class UserProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: this.props.show,
    };
    bindHandlers(this, 'handleClose', 'handleLogout');
  }

  /**
   * Renders component view
   */
  render() {
    // console.log('Guide.render()', this.state);
    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Google account</Modal.Title>
        </Modal.Header>
        {this.renderMain()}
        <Modal.Footer>
          <Button bsStyle="default" className={styles.logout} onClick={this.handleLogout} title="Sign out">Sign Out</Button>
          <Button onClick={this.handleClose} title="Close">Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  renderMain() {
    return (
      <Modal.Body>
        <div className={styles.container}>
          <Image src={this.props.userImage} alt={this.props.userName} circle />
          <div>
            <p className={styles.userName}>{this.props.userName}</p>
            <p className={styles.userEmail}>{this.props.userEmail}</p>
            <Button bsStyle="info" href="https://myaccount.google.com/" target="_blank" title="Go to your Google account">Google account</Button>
          </div>
        </div>
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

  /**
   * Handle logout action
   */
  handleLogout() {
    this.setState({
      show: false,
    });
    this.props.handleClose();
    this.props.handleLogout();
  }
}
