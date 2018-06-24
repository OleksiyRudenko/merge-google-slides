import React, { Component } from 'react';
import {
  Button, Col, Glyphicon, Grid, Panel, Row,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import SourceDeck from "../SourceDeck";
import "./SourceDecks.css";

export default class SourceDecks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      decks: this.props.sourceList,
    };
    bindHandlers(this,
      'renderPanelBody',
    );
  }

  /**
   * Renders component view
   */
  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Glyphicon glyph="th" /> <span className="hidden-xs">Source decks</span>{' '}
          <Button bsStyle="link" bsSize="small" title="Render preview">
            <Glyphicon glyph="play" />
          </Button>
        </Panel.Heading>
        { this.renderPanelBody() }
      </Panel>
    );
  }

  /**
   * Renders panel body
   * @returns {*}
   */
  renderPanelBody() {
    return (
      <Panel.Body>
        <Grid>
          <Row>
            {this.state.decks.map(id => {
              return (<Col xs={3} className="col-padding" key={id}><SourceDeck deckId={id} /></Col>);
            })}
          </Row>
        </Grid>
      </Panel.Body>
    );
  }
}
