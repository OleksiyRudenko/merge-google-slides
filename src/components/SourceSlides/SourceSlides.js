import React, { Component } from 'react';
import {
  Button, Glyphicon, Panel,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
// import styles from './SourceSlides.css';

export default class SourceSlides extends Component {
  constructor(props) {
    super(props);
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
      </Panel.Body>
    );
  }
}
