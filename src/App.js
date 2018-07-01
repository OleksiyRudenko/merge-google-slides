import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Button, Image, MenuItem,  Navbar, Nav, NavDropdown, NavItem, OverlayTrigger, ProgressBar, Tooltip } from 'react-bootstrap';
import {bindHandlers} from './utils/bind.js';
import logo from './merge-google-slides.png';
import styles from './App.css';
import Announcement from "./components/Announcement";
import Welcome from './components/Welcome';
import Dashboard from './components/Dashboard';
import UserProfile from "./components/UserProfile";

class App extends Component {
  constructor(props) {
    super(props);
    bindHandlers(this,
      'handleGapiStateChange',
      'handleAnnouncementClose',
      'showWelcome',
      'handleWelcomeClose',
      'showUserProfile',
      'handleUserProfileClose',
      'onSignIn',
      );
    this.props.gapi.setStateHandler(this.handleGapiStateChange);
    this.state = {
      showAnnouncement: true,
      showWelcome: false,
      showUserProfile: false,
      gapiState: this.props.gapi.state,
      userName: null,
      userEmail: null,
      userImage: null,
    };
    // console.log('App.constructor() this.props.gapi:', this.props.gapi);
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
              <NavItem href="https://oleksiyrudenko.github.io/merge-google-slides--privacy-policy.html" target="_blank">
                  Privacy Policy
                </NavItem>
              <NavItem href="https://oleksiyrudenko.github.io/general--terms-of-service.html" target="_blank">
                Terms of Service
              </NavItem>
              {/*<NavItem href="https://github.com/OleksiyRudenko/merge-google-slides" target="_blank">
                GitHub
              </NavItem>*/}
            </Nav>
            { this.state.gapiState.isSignedIn ? <Nav pullRight><NavItem>{this.renderGoogleSignOut()}</NavItem></Nav> : '' }
          </Navbar.Collapse>
        </Navbar>
        { this.state.showAnnouncement ?
          <Announcement
            announcementStyle="warning"
            title="Important note!"
            message={<React.Fragment>
              This app is in alpha state and is publicly available only since otherwise I cannot proceed developing it.
              MVP is expected somewhere in <strike>August</strike> late July.
            </React.Fragment>}
            callToAction="Learn more"
            action={this.showWelcome}
            handleClose={this.handleAnnouncementClose}
          /> : '' }
        { this.state.showWelcome ? <Welcome show={this.state.showWelcome} handleClose={this.handleWelcomeClose} /> : '' }
        { this.state.showUserProfile ?
          <UserProfile
            show={this.state.showUserProfile}
            userImage={this.state.userImage}
            userName={this.state.userName}
            userEmail={this.state.userEmail}
            handleClose={this.handleUserProfileClose}
            handleLogout={this.props.gapi.handleSignoutClick}
          /> : '' }
      </React.Fragment>
    );
  }

  renderGoogleLoaders() {
    return (
      <div className={styles.googleLoader}>
        { this.state.gapiState.isClientLoaded
          ? (this.state.gapiState.isSignInRequired ? this.renderDefaultGoogleSignIn('Please, sign in with your Google account') :
            <ProgressBar striped bsStyle="success" now={100} active label="Authenticating with Google..." />)
          : <ProgressBar striped bsStyle="warning" now={100} active label="Loading Google libraries..." />
        }
      </div>
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
        <p>{message}
          {/*<div className="g-signin2" data-onsuccess="GapiService.handleAuthClick" data-width="300" data-height="200" data-longtitle="true"></div>
          <Button bsStyle="primary" bsSize="large" onClick={this.props.gapi.handleAuthClick}>Sign In</Button> */}
        </p>
        <div id="g-signin2" />
        <p/>
        <p><b>Why should I?</b></p>
        <p>For the app could load the Slides to merge.</p>
        <p><b>Is this app verified by Google?</b></p>
        <p>It is under revision yet. Please, check come back later (not sure yet when and how the verification process would complete)
        or when prompted click <u>Advanced</u> and then <u>Go to oleksiyrudenko.github.io (unsafe)</u>.</p>
      </React.Fragment>
    );
  }

  /**
   * Render Google Sign-Out button
   * @returns {*}
   */
  renderGoogleSignOut() {
    return (
      <React.Fragment>
        {this.state.userName
          ? <div className={styles.userProfileContainer}>
              <OverlayTrigger placement="bottom" onClick={this.showUserProfile} overlay={
                <Tooltip className={styles.profileTooltip} id="App-user-ptofile-tooltip" positionLeft={100} arrowOffsetLeft={20}>
                  <p><strong>Google account</strong></p>
                  <p>{this.state.userName}</p>
                  <p>{this.state.userEmail}</p>
                </Tooltip>}>
                <Image className={styles.userImage} src={this.state.userImage} alt={this.state.userName} circle responsive />
              </OverlayTrigger>
            </div>
          : <Button bsStyle="default" bsSize="xsmall" onClick={this.props.gapi.handleSignoutClick}>Sign Out</Button>}
      </React.Fragment>
    );
  }

  /**
   * Call back on successful google sign-in
   * @param googleUser
   */
  onSignIn(googleUser) {
    const profile = googleUser.getBasicProfile();
    this.props.gapi.setState({
      isSignedIn: true,
      isSignInRequired: false,
    });
    console.log('App.onSignIn() profile', profile);
    this.props.gapi.getUserProfile().then(uprofile => {
      console.log('App.onSignIn() profile from gapi', uprofile);
    });
  }

  /**
   * Imports gapi state. Called from this.props.gapi
   * @param gapiState
   */
  handleGapiStateChange(gapiState) {
    // console.log('App.handleGapiStateChange()', gapiState);
    this.setState({
      gapiState: gapiState,
    });
    this.state.gapiState.isClientLoaded &&
      this.state.gapiState.isSignInRequired &&
      this.props.gapi.renderSignInButton(this.onSignIn, 50);
    // preload profile
    if (this.state.gapiState.isSignedIn) {
      this.props.gapi.getUserProfile().then(profile => {
        console.log('App.handleGapiStateChange', profile);
        this.setState({
          userName: profile.profile.name,
          userEmail: profile.profile.email,
          userImage: profile.profile.image,
        });
      });
    }
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
    // console.log('App.handleWelcomeClose()');
    this.setState({
      showWelcome: false,
    });
  }

  /**
   * Set Welcome component visible
   */
  showUserProfile() {
    console.log("App.showUserProfile()");
    this.setState({
      showUserProfile: true,
    });
  }

  /**
   * Set Welcome component hidden
   */
  handleUserProfileClose() {
    // console.log('App.handleWelcomeClose()');
    this.setState({
      showUserProfile: false,
    });
  }


  /**
   * Set Announcement component hidden
   */
  handleAnnouncementClose() {
    // console.log('App.handleAnnouncementClose()');
    this.setState({
      showAnnouncement: false,
    });
  }
}

export default App;
