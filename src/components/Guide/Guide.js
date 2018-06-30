import React, { Component } from 'react';
import { Button, Carousel, Col, Glyphicon, Modal, Nav, NavItem, Row, Tab } from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import './Guide.css';

const guide = [
  {
    eventKey: 'guide-installation',
    images: [
      {url: 'mgs-x01-install-01.png', caption: 'In your Drive click New, then More, and Connect more apps'},
      {url: 'mgs-x01-install-02.png', caption: 'Search for Merge Google Slides and click Connect'},
      {url: 'mgs-x01-install-03.png',
        caption: 'Hold Ctrl or Shift and click a couple of decks, then Right-Click and select Open with > Merge Slides'},
      {url: 'mgs-x01-install-04.png', caption: 'Once in app Sign in with Google'},
      {url: 'mgs-x01-install-05.png', caption: 'Click Show advanced, follow the app address, review permissions and click Allow'},
      {url: 'mgs-x01-install-06.png', caption: 'You will see your decks preview rendering'},
      {url: 'mgs-x01-install-07.png', caption: 'And finally all ready to merge!'}
    ],
  },
  {
    eventKey: 'guide-usage',
    images: [
      {url: 'mgs-x02-use-01.png', caption: 'Hold Ctrl or Shift and click a couple of decks, then Right-Click and select Open with > Merge Slides'},
      {url: 'mgs-x02-use-02.png', caption: 'You will see your decks preview rendering'},
      {url: 'mgs-x02-use-03.png', caption: 'And finally all ready to merge!'}
    ],
  },
  {
    eventKey: 'guide-uninstallation',
    images: [
      {url: 'mgs-x03-uninstall-01.png', caption: 'In your Drive click Cog icon and then Settings'},
      {url: 'mgs-x03-uninstall-02.png',
        caption: 'Click Manage Apps on the left, locate Merge Slides, tap Options, and Disconnect from Drive'}
    ],
  }
];
const guideImagesBaseUrl = './guide/640x400/';


export default class Guide extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: this.props.show,
    };
    bindHandlers(this, 'handleClose');
    // console.log('Guide::state', this.state);
  }

  /**
   * Renders component view
   */
  render() {
    // console.log('Guide.render()', this.state);
    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>This app is intented to get launched from your Google Drive!</Modal.Title>
        </Modal.Header>
        {this.renderMain()}
        <Modal.Footer>
          <Button bsStyle="primary" href="https://drive.google.com/" target="_blank">Open your Google Drive</Button>
          <Button onClick={this.handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  renderMain() {
    return (
      <Modal.Body>
        <Tab.Container id="app-guide" defaultActiveKey="guide-installation">
          <Row className="clearfix">
            <Col sm={12}>
              <Nav bsStyle="tabs">
                <NavItem eventKey="guide-installation">
                  <Glyphicon glyph="plus" /> Installation
                </NavItem>
                <NavItem eventKey="guide-usage">
                  <Glyphicon glyph="star" /> Usage
                </NavItem>
                <NavItem eventKey="guide-uninstallation">
                  <Glyphicon glyph="minus" /> Uninstallation
                </NavItem>
              </Nav>
            </Col>
            <Col sm={12}>
              <Tab.Content animation>
                {guide.map((item, idx) => <Tab.Pane key={idx} eventKey={item.eventKey}>{this.renderCarousel(item.images)}</Tab.Pane>)}
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Modal.Body>
    );
  }

  /**
   * Render carousel of images
   * @param {Array} images of images names
   * @returns {*}
   */
  renderCarousel(images) {
    return (
      <Carousel interval={10000}>
        {images.map((image, idx) => <Carousel.Item key={idx}>
          <img src={guideImagesBaseUrl + image.url} alt={image.url}/>
          <Carousel.Caption>
            <p>{image.caption}</p>
          </Carousel.Caption>
        </Carousel.Item>)}
      </Carousel>
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
