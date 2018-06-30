import React, { Component } from 'react';
import queryString from 'qs';
import { Col,
//  Glyphicon,
  Grid,
//  Nav, NavItem, Panel,
  Row,
//  Tab
} from 'react-bootstrap';
import "./Dashboard.css";
// import SettingsFile from '../SettingsFile';
// import Destination from '../Destination';
// import RenderingOptions from '../RenderingOptions';
import OutputPreview from '../OutputPreview';
import SourceDecks from '../SourceDecks';
import Guide from '../Guide';
import {bindHandlers} from "../../utils/bind";
import {SourceDecksService} from "../../services/SourceDecksService";

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    const urlParams = this.props.location.search ? queryString.parse(this.props.location.search.slice(1)) : {state: null};
    this.state = {
      urlParams: urlParams,
      driveState: JSON.parse(urlParams.state),
      renderingKey: Math.random(),
      showGuide: !urlParams.state,
    };
    bindHandlers(this, 'refreshAll', 'showGuide', 'handleGuideClose');
    console.log('Dashboard::state', this.state);
  }
  /**
   * Renders component view
   */
  render() {
    console.log('Dashboard.render()', this.state);
    return (
      <React.Fragment>
        {/*<Grid>
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
        </Grid> */}
        <Grid>
          <Row className="clearfix">
            <Col xs={4} sm={4} md={3} lg={2} className="col-padding">
              <OutputPreview key={this.state.renderingKey + 0} />
            </Col>
            <Col xs={8} sm={8} md={9} lg={10} className="col-padding">
              <SourceDecks sourceList={this.state.driveState ? this.state.driveState.exportIds : []}
                           refreshHandler={this.refreshAll}
                           key={this.state.renderingKey + 1} />
            </Col>
          </Row>
        </Grid>
        {this.showGuide ? <Guide show={this.state.showGuide} handleClose={this.handleGuideClose} /> : ''}
      </React.Fragment>
    );
  }

  /**
   * Clear caches for decks|deck and/or slides thumbnails
   */
  refreshAll() {
    console.log('Dashboard.refreshAll()');
    SourceDecksService.clearCache();
    this.setState({
      renderingKey: Math.random(),
    });
  }

  /**
   * Set Welcome component visible
   */
  showGuide() {
    this.setState({
      showGuide: true,
    });
  }

  /**
   * Set Welcome component hidden
   */
  handleGuideClose() {
    console.log('Dashboard.handleGuideClose()');
    this.setState({
      showGuide: false,
    });
  }
}
