import React, { Component } from 'react';
import { Button, Image, Col, Row, Glyphicon, Grid, MenuItem,
  Navbar, Nav, NavDropdown, NavItem, Panel, Tabs, Tab } from 'react-bootstrap';
import styles from './Dashboard.css';
import SettingsFile from '../SettingsFile';
import Destination from '../Destination';
import RenderingOptions from '../RenderingOptions';
import OutputPreview from '../OutputPreview';
import SourceSlides from '../SourceSlides';
import logo from '../../merge-google-slides.png';

export default class Dashboard extends Component {
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
                  Privacy Policy
                </MenuItem>
                <MenuItem href="http://getbootstrap.com/components/#glyphicons" target="_blank">
                  Terms of Service
                </MenuItem>
              </NavDropdown>
              <NavItem href="https://github.com/OleksiyRudenko/merge-google-slides" target="_blank">
                  GitHub
              </NavItem>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Grid><Row>
        <Tab.Container id="dashboard-settings" defaultActiveKey="settings-file">
          <Row className="clearfix">
            <Col sm={12}>
              <Nav bsStyle="tabs">
                <NavItem eventKey="x-collapsed" title="Minimize settings block">
                  <Glyphicon glyph="collapse-up" />
                </NavItem>
                <NavItem eventKey="settings-file">
                  <Glyphicon glyph="cog" /> <span className="hidden-xs">Settings file</span>
                </NavItem>
                <NavItem eventKey="rendering-options">
                  <Glyphicon glyph="wrench" /> <span className="hidden-xs">Rendering options</span>
                </NavItem>
                <NavItem eventKey="destination">
                  <Glyphicon glyph="floppy-save" /> <span className="hidden-xs">Output destination</span>
                </NavItem>
              </Nav>
            </Col>
            <Col sm={12}>
              <Tab.Content animation>
                <Tab.Pane eventKey="settings-file"><SettingsFile/></Tab.Pane>
                <Tab.Pane eventKey="rendering-options"><RenderingOptions/></Tab.Pane>
                <Tab.Pane eventKey="destination"><Destination/></Tab.Pane>
                <Tab.Pane eventKey="x-collapsed"> </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
        </Row></Grid>

        <Grid>
          <Row>
            <Col xs={4} sm={4} md={3} lg={2}>
              <OutputPreview />
            </Col>
            <Col xs={8} sm={8} md={9} lg={10}>
              <SourceSlides />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
