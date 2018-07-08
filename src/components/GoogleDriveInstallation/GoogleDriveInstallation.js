import React, { Component } from 'react';
import { Button, Carousel, Image, ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import ButtonWorksWithGoogleDrive from "../ButtonWorksWithGoogleDrive/ButtonWorksWithGoogleDrive";
// import ButtonInstallOnGoogleDrive from "../ButtonInstallOnGoogleDrive/ButtonInstallOnGoogleDrive";
import styles from "./GoogleDriveInstallation.css";
import ButtonSignInWithGoogle from "../ButtonSignInWithGoogle/ButtonSignInWithGoogle";
import {bindHandlers} from "../../utils/bind";

const images = [
  {url: 'mgs-x02-use-01.png', caption: 'Pick Slides, Right-Click and Open with > Merge Slides'},
  {url: 'mgs-x02-use-03.png', caption: 'Get them merged!'}
  ];
const imagesBaseUrl = './guide/640x400/';

export default class GoogleDriveInstallation extends Component {
  constructor(props) {
    super(props);
    this.debug = false;
    // this.installationCodeParamName = this.props.gapi.gapiParams.gDrive.installationCodeParamName;
    bindHandlers(this, 'onSignIn');
    this.debug && console.log('GoogleDriveInstallation::props, state, installation URL', this.props, this.state, this.props.gapi.getGDriveInstallationUrl());
  }

  componentDidMount() {
    this.debug && console.log('GoogleDriveInstallation.cDM()');
  }

  componentDidUpdate() {
    this.debug && console.log('GoogleDriveInstallation.cDU()');
    this.props.gapi.state.isClientLoaded && this.props.gapi.state.isSignInRequired && this.props.gapi.renderSignInButton(this.onSignIn, 50);
  }

  /**
   * Renders component view
   */
  render() {
    this.debug && console.log('GoogleDriveInstallation.render()', this.state);
    return (
      <div className={styles.page}>
        <h2><Image src="./ico/android-icon-48x48.png" /> Merge Google Slides at a breeze!</h2>
        <div>
          <ButtonWorksWithGoogleDrive href="https://chrome.google.com/webstore/detail/merge-google-slides/apjijeojdpjochnfenmmkegnifcgfaam" />
        </div>
        <hr />
        <div className={styles.container}>
          <div>
            {this.props.gapi.state.isSignedIn
              ? <React.Fragment>
                <h3>You've been already signed in.</h3>
                <div>To select Slides to merge navigate to either of
                  <ListGroup>
                    <ListGroupItem href="https://drive.google.com/drive/" target="_blank">
                      <img src="./assets/Google-Drive-icon-x24.png" alt="Google Drive icon" /> Google Drive™
                    </ListGroupItem>
                    <LinkContainer to="/" exact>
                      <ListGroupItem>
                        <img src="./ico/favicon-32x32.png" width="24" alt="Merge Google Slides icon" /> Merge Google Slides home page
                      </ListGroupItem>
                    </LinkContainer>
                  </ListGroup>
                </div>
              </React.Fragment>
              : <React.Fragment>
                <h3>First time here?</h3>
                <p>Login and authorize the app.</p>
                <div>
                  <ButtonSignInWithGoogle />
                  {/*<ButtonInstallOnGoogleDrive bsSize="large" href={this.props.gapi.getGDriveInstallationUrl().toString()} /> */}
                </div>
                <h3>Already have the app installed?</h3>
                <p>Please, sign in with your Google account above</p>
                {/*<ButtonSignInWithGoogle /> */}
                <p><b>I did before. Why again?</b></p>
                <p>Possible reasons are:</p>
                <ul>
                  <li>you might have logged out before</li>
                  <li>you might be using another browser or different computer this time</li>
                  <li>we might have changed required features from Google API</li>
                </ul>
                <p>
                  The sign in is required for the app to load the Slides to merge. Please, review carefully the powers you grant to this app.
                  You may also want to make yourself familiar
                  with <a href="https://oleksiyrudenko.github.io/merge-google-slides--privacy-policy.html">Privacy Policy</a> at this stage.
                </p>
                <p><b>Is this app verified by Google?</b></p>
                <p>It is under revision yet. Not sure yet when and how the verification process would complete.
                  Please, come back later or when prompted click <u>Advanced</u> and then <u>Go to oleksiyrudenko.github.io (unsafe)</u>.</p>
              </React.Fragment>}
          </div>
          <div>
            <h3>How to use?</h3>
            <div className={styles.carouselContainer}>{this.renderCarousel(images)}</div>
            <div>
              <Button target="_blank" href="https://oleksiyrudenko.github.io/merge-google-slides/?state=%7B%22exportIds%22:%5B%221sLBRTLD5fTsRIi5rr-ndVD554G9odLdbHdFDfWY8Y10%22,%221L2NSaN4dPK0u8iuiqDtt5RaWHEeRZvY0Eybc_TPhXTw%22,%221ri6oKxQFjElzFhMPE_NeiQZh7xYY6lOA02Azc_ZJroQ%22%5D,%22action%22:%22open%22,%22userId%22:%22109188810585487526474%22%7D">Try it with demo Slides (read-only mode)</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderCarousel(images) {
    return (
      <Carousel interval={5000}>
        {images.map((image, idx) => <Carousel.Item key={idx}>
          <img src={imagesBaseUrl + image.url} alt={image.url}/>
          <Carousel.Caption>
            <p>{image.caption}</p>
          </Carousel.Caption>
        </Carousel.Item>)}
      </Carousel>
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
    this.debug && console.log('GoogleDriveInstallation.onSignIn() profile', profile);
    this.props.gapi.getUserProfile().then(uprofile => {
      this.debug && console.log('GoogleDriveInstallation.onSignIn() profile from gapi', uprofile);
    });
  }
}
