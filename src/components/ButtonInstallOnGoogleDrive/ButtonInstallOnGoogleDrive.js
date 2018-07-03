import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import logo from './Google-Drive-Logo--with-gray-Google--x250.png';
import styles from './ButtonInstallOnGoogleDrive.css'

export default class ButtonInstallOnGoogleDrive extends Component {
  /**
   * Renders component view
   */
  render() {
    return (
      <Button bsStyle={this.props.bsStyle || 'default'} bsSize={this.props.bsSize || 'large'} href={this.props.href}>
        Install on <img src={logo} className={styles.logo} alt="Google Drive logo" />
      </Button>
    );
  }
}
