import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Button, Image, MenuItem,  Navbar, Nav, NavDropdown, NavItem, ProgressBar } from 'react-bootstrap';
import {bindHandlers} from './utils/bind.js';
import logo from './merge-google-slides.png';
import styles from './App.css';
import Announcement from "./components/Announcement";
import Welcome from './components/Welcome';
import Dashboard from './components/Dashboard';

class App extends Component {
  constructor(props) {
    super(props);
    bindHandlers(this,
      'handleGapiStateChange',
      'handleAnnouncementClose',
      'showWelcome',
      'handleWelcomeClose',
      );
    this.props.gapi.setStateHandler(this.handleGapiStateChange);
    this.state = {
      showAnnouncement: true,
      showWelcome: false,
      gapiState: this.props.gapi.state,
    };
    console.log('App: ', this.props.gapi);
  }

  componentDidMount() {
    this.handleGapiStateChange(this.props.gapi.state);
  }

  render() {
    return (
      <Router>
        <React.Fragment>
          {this.renderNavbar()}
          {this.state.gapiState.isSignedIn ? <Route path="/" component={Dashboard} /> : this.renderGoogleLoaders()}
        </React.Fragment>
      </Router>
    );
  }

  renderNavbar() {
    return (
      <React.Fragment>
        <Navbar inverse fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <Image src={logo} alt="Merge Google Slides logo" />
              Merge Google Slides
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavDropdown eventKey={1} title="Docs" id="basic-nav-dropdown">
                <MenuItem href="https://react-bootstrap.github.io/components/navbar/" target="_blank">
                  Privacy Policy
                </MenuItem>
                <MenuItem href="http://getbootstrap.com/components/#glyphicons" target="_blank">
                  Terms of Service
                </MenuItem>
              </NavDropdown>
              <NavItem href="https://github.com/OleksiyRudenko/merge-google-slides" target="_blank">
                GitHub
              </NavItem>
              <NavItem>
                { this.state.gapiState.isSignedIn ? this.renderGoogleSignOut() : this.renderGoogleSignIn() }
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        { this.state.showAnnouncement ?
          <Announcement
            announcementStyle="warning"
            title="Important note!"
            message="This app is in alpha state and is publicly available only since otherwise I cannot proceed developing it. MVP is expected somewhere in August."
            callToAction="Learn more"
            action={this.showWelcome}
            handleClose={this.handleAnnouncementClose}
          /> : '' }
        { this.state.showWelcome ? <Welcome show={this.state.showWelcome} handleClose={this.handleWelcomeClose} /> : '' }
      </React.Fragment>
    );
  }

  renderGoogleLoaders() {
    return (
      <div className={styles.googleLoader}>
        { this.state.gapiState.isClientLoaded
          ? (this.state.gapiState.isSignInRequired ? this.renderDefaultGoogleSignIn('Please, sign in to your Google account')/*this.renderGoogleSignIn('large', 'Please, sign in to your Google account')*/ :
            <ProgressBar striped bsStyle="success" now={100} active label="Authenticating with Google..." />)
          : <ProgressBar striped bsStyle="warning" now={100} active label="Loading Google libraries..." />
        }
      </div>
    );
  }

  /**
   * Render Google Sign-In button
   * @param {string} buttonSize
   * @param {string} message
   * @returns {*}
   */
  renderGoogleSignIn(buttonSize="xsmall", message) {
    if (message) message+=' ';
    return (
      <React.Fragment>
        {message}
        <Button bsStyle="primary" bsSize={buttonSize} onClick={this.props.gapi.handleAuthClick}>Sign In</Button>
      </React.Fragment>
    );
  }

  /**
   * Render Google Sign-In button
   * @param {string} message
   * @returns {*}
   */
  renderDefaultGoogleSignIn(message) {
    if (message) message+=' ';
    return (
      <React.Fragment>
        {message}
        <div className="g-signin2" data-onsuccess="GapiService.handleAuthClick"></div>
        <Button bsStyle="primary" bsSize="large" onClick={this.props.gapi.handleAuthClick}>Sign In</Button>
      </React.Fragment>
    );
  }

  /**
   * Render Google Sign-Out button
   * @returns {*}
   */
  renderGoogleSignOut() {
    return (
      <Button bsStyle="default" bsSize="xsmall" onClick={this.props.gapi.handleSignoutClick}>Sign Out</Button>
    );
  }

  /**
   * Imports gapi state. Called from this.props.gapi
   * @param gapiState
   */
  handleGapiStateChange(gapiState) {
    console.log('App.handleGapiStateChange()', gapiState);
    this.setState({
      gapiState: gapiState,
    });
  }

  /**
   * Set Welcome component visible
   */
  showWelcome() {
    this.setState({
      showWelcome: true,
    });
  }

  /**
   * Set Welcome component hidden
   */
  handleWelcomeClose() {
    console.log('App.handleWelcomeClose()');
    this.setState({
      showWelcome: false,
    });
  }

  /**
   * Set Announcement component hidden
   */
  handleAnnouncementClose() {
    console.log('App.handleAnnouncementClose()');
    this.setState({
      showAnnouncement: false,
    });
  }
}

export default App;
