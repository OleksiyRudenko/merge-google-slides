import React, { Component } from 'react';
import {
  Button, Col, Glyphicon, Grid, Panel, Row,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import SourceDeck from "../SourceDeck";
import styles from "./SourceDecks.css";
import {SourceDecksService} from "../../services/SourceDecksService";

export default class SourceDecks extends Component {
  constructor(props) {
    super(props);
    SourceDecksService.setDeckIds(this.props.sourceList);
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
          <Row className={styles.rowFlex}>
            {this.state.decks.map(id => {
              return (<Col className="col-padding col-min" key={id}><SourceDeck deckId={id} /></Col>);
            })}
          </Row>
        </Grid>
      </Panel.Body>
    );
  }
}
