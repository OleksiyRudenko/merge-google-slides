import React, { Component } from 'react';
import { Image, Col, Row, Grid, Glyphicon, Navbar, Nav, NavItem, NavDropdown, MenuItem, Jumbotron, Button } from 'react-bootstrap';
import styles from './Dashboard.css';
import Settings from '../Settings';
import Destination from '../Destination';
import OutputPreview from '../OutputPreview';
import SourceSlides from '../SourceSlides';
import logo from '../../merge-google-slides.png';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
  }

  /**
   * Renders component view
   */
  render() {
    return (
      <div>
        <Navbar inverse fixedTop>
          <Navbar.Header>
            <Navbar.Brand>
              <Image src={logo} alt="Merge Google Slides logo" />
              <a href="#">Merge Google Slides</a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              <NavDropdown eventKey={1} title="Docs" id="basic-nav-dropdown">
                <MenuItem href="https://react-bootstrap.github.io/components/navbar/" target="_blank">
                  React Bootstrap
                </MenuItem>
                <MenuItem href="http://getbootstrap.com/components/#glyphicons" target="_blank">
                  Bootstrap Glyphicons
                </MenuItem>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Grid>
          <Row>
            <Col xs={12} md={6}>
              <Settings />
            </Col>
            <Col xs={12} md={6}>
              <Destination />
            </Col>
          </Row>
          <Row>
            <Col xs={1}>
              <OutputPreview />
            </Col>
            <Col xs={2} md={11}>
              <SourceSlides />
              <Button bsSize="large">
                <Glyphicon glyph="star" /> Star
              </Button>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
