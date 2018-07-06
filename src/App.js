import React, { Component } from 'react';
import { HashRouter as Router, Route, Redirect } from 'react-router-dom';
import { Button, Image,  Navbar, Nav, NavItem, OverlayTrigger, ProgressBar, Tooltip } from 'react-bootstrap';
import {bindHandlers} from './utils/bind.js';
import styles from './App.css';
import Announcement from "./components/Announcement";
import Welcome from './components/Welcome';
import Dashboard from './components/Dashboard';
import UserProfile from "./components/UserProfile";
import GoogleDriveInstallation from "./components/GoogleDriveInstallation";

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
    console.log('App.constructor() props', this.props);
  }

  componentDidMount() {
    this.handleGapiStateChange(this.props.gapi.state);
  }

  render() {
    console.log('App.render() props, window.location', this.props, window.location);
    return (
      <Router noslash basename="">
        <React.Fragment>
          {this.renderNavbar()}
          {this.props.gapi.state.isClientLoaded
            ? <React.Fragment>
                <Route exact path="/"
                       render={routeProps => (
                         this.props.gapi.state.isSignedIn
                           ? <Dashboard {...routeProps} gapi={this.props.gapi} gDriveState={this.props.gDriveState} />
                           : <Redirect to="/install" />
                       )}
                />
                <Route exact path="/install"
                  render={routeProps => <GoogleDriveInstallation {...routeProps} gapi={this.props.gapi} /> }
                />
            </React.Fragment>
            : this.renderGoogleLoaders()}
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
              <Image src="./ico/android-icon-48x48.png" alt="Merge Google Slides logo" />
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
            { this.props.gapi.state.isSignedIn ? <Nav pullRight><NavItem>{this.renderGoogleSignOut()}</NavItem></Nav> : '' }
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
        { this.props.gapi.state.isClientLoaded
          ? <ProgressBar striped bsStyle="success" now={100} active label="Authenticating with Google..." />
          : <ProgressBar striped bsStyle="warning" now={100} active label="Loading Google libraries..." />
        }
      </div>
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
                <Tooltip className={styles.profileTooltip} id="App-user-profile-tooltip" positionLeft={100} arrowOffsetLeft={20}>
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
