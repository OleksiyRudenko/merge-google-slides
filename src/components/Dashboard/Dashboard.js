import React, { Component } from 'react';
import queryString from 'query-string';
import { Col, Glyphicon, Grid, Nav, NavItem, Panel, Row, Tab } from 'react-bootstrap';
import "./Dashboard.css";
import SettingsFile from '../SettingsFile';
import Destination from '../Destination';
import RenderingOptions from '../RenderingOptions';
import OutputPreview from '../OutputPreview';
import SourceDecks from '../SourceDecks';
import Welcome from '../Welcome';
import {bindHandlers} from "../../utils/bind";

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    const urlParams = queryString.parse(this.props.location.search);
    this.state = {
      showWelcome: true,
      urlParams: urlParams,
      driveState: JSON.parse(urlParams.state),
    };
    console.log('Dashboard::state', this.state);
    bindHandlers(this,
      'handleWelcomeClose',
    );
  }
  /**
   * Renders component view
   */
  render() {
    console.log('Dashboard.render()', this.state);
    return (
      <React.Fragment>
        <Grid>
          <Row>
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
                    <Tab.Pane eventKey="x-collapsed"><Panel><Panel.Body>Click either tab above to expand settings</Panel.Body></Panel></Tab.Pane>
                  </Tab.Content>
                </Col>
              </Row>
            </Tab.Container>
          </Row>
        </Grid>
        <Grid>
          <Row className="clearfix">
            <Col xs={4} sm={4} md={3} lg={2} className="col-padding">
              <OutputPreview />
            </Col>
            <Col xs={8} sm={8} md={9} lg={10} className="col-padding">
              <SourceDecks sourceList={this.state.driveState.exportIds} />
            </Col>
          </Row>
        </Grid>
        <Welcome show={this.state.showWelcome} handleClose={this.handleWelcomeClose} />
      </React.Fragment>
    );
  }

  handleWelcomeClose() {
    console.log('CLosing Welcome');
    this.setState({
      showWelcome: false,
    });
  }
}
