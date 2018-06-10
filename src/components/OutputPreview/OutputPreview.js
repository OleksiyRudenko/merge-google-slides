import React, { Component } from 'react';
import {
  Button, Glyphicon, Panel,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
// import styles from './OutputPreview.css';

export default class OutputPreview extends Component {
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
          <Glyphicon glyph="film" /> <span className="hidden-xs">Preview</span>{' '}
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
