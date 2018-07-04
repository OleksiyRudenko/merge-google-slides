import React, { Component } from 'react';
import queryString from 'qs';
import { Button, Carousel, ListGroup, ListGroupItem } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import ButtonWorksWithGoogleDrive from "../ButtonWorksWithGoogleDrive/ButtonWorksWithGoogleDrive";
import ButtonInstallOnGoogleDrive from "../ButtonInstallOnGoogleDrive/ButtonInstallOnGoogleDrive";
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
    this.installationCodeParamName = this.props.gapi.gapiParams.gDrive.installationCodeParamName;
    const defaultGDriveInstallationParam = {};
    defaultGDriveInstallationParam[this.installationCodeParamName] = null;
    const urlParams = this.props.location.search ? queryString.parse(this.props.location.search.slice(1)) : defaultGDriveInstallationParam;
    this.state = {
      urlParams: urlParams,
    };
    bindHandlers(this, 'onSignIn');
    console.log('GoogleDriveInstallation::props, state, installation URL', this.props, this.state, this.props.gapi.getGDriveInstallationUrl());
  }

  componentDidMount() {
    console.log('GoogleDriveInstallation.cDM()');
  }

  componentDidUpdate() {
    console.log('GoogleDriveInstallation.cDU()');
    this.props.gapi.state.isClientLoaded && this.props.gapi.state.isSignInRequired && this.props.gapi.renderSignInButton(this.onSignIn, 50);
  }

  /**
   * Renders component view
   */
  render() {
    console.log('GoogleDriveInstallation.render()', this.state);
    return (
      <div className={styles.container}>
        <div>
          <h3>First time here?</h3>
          <div>
            <ButtonInstallOnGoogleDrive bsSize="large" href={this.props.gapi.getGDriveInstallationUrl().toString()} />
          </div>
          <div className={styles.carouselContainer}>{this.renderCarousel(images)}</div>
          <div>
            <Button target="_blank" href="https://oleksiyrudenko.github.io/merge-google-slides/?state=%7B%22exportIds%22:%5B%221sLBRTLD5fTsRIi5rr-ndVD554G9odLdbHdFDfWY8Y10%22,%221L2NSaN4dPK0u8iuiqDtt5RaWHEeRZvY0Eybc_TPhXTw%22,%221ri6oKxQFjElzFhMPE_NeiQZh7xYY6lOA02Azc_ZJroQ%22%5D,%22action%22:%22open%22,%22userId%22:%22109188810585487526474%22%7D">Try with demo Slides</Button>
          </div>
          <div>
            <ButtonWorksWithGoogleDrive href="https://chrome.google.com/webstore/detail/merge-google-slides/apjijeojdpjochnfenmmkegnifcgfaam" />
          </div>
        </div>
        <div>
          <h3>Already have the app installed?</h3>
          {this.props.gapi.state.isSignedIn ?
            <React.Fragment>
                <div>You've been already signed in.</div>
                <div>To select Slides to merge navigate to either
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
            : <ButtonSignInWithGoogle />
            }
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
    console.log('GoogleDriveInstallation.onSignIn() profile', profile);
    this.props.gapi.getUserProfile().then(uprofile => {
      console.log('GoogleDriveInstallation.onSignIn() profile from gapi', uprofile);
    });
  }
}
