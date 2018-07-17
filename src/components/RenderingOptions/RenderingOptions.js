import React, { Component } from 'react';
import {
  Button, ButtonToolbar, Checkbox, Form, FormControl, FormGroup, Glyphicon, InputGroup, Panel,
  ToggleButton, ToggleButtonGroup,
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import {SourceDecksService} from "../../services/SourceDecksService";

export default class RenderingOptions extends Component {
  constructor(props) {
    super(props);
    bindHandlers(this,
      'setFileName',
      'setFileNameFromDecks',
      'restoreOriginalFilename',
      'renderMainControls',
      'renderPanelBody',
      'renderComponentStateControls',
      'switchStateFileExists',
      'switchStateOriginalFileName',
      'uiSwitchPanelState',
    );
    this.state = {
      originalFileName: null,
      fileName: '',
      fileExists: false,
      decksList: null,
      uiIsPanelCollapsed: false,
      uiShowComponentStateControls: true,
    };
    if (this.state.originalFileName) this.state.fileName = this.state.originalFileName;
  }

  /**
   * Update data (e.g. from Promises) when component did mount
   */
  componentDidMount() {
    SourceDecksService.getDecksList().then(list => {
      this.setState({
        decksList: list,
      });
    });
  }

  // === Renderers
  /**
   * Renders component view
   */
  render() {
    return (
      <Panel>
        <Panel.Heading>
          <Glyphicon glyph="wrench" /> Rendering options
          { this.state.uiIsPanelCollapsed && this.state.fileName.length ? ": " + this.state.fileName : "" }
          <Button bsSize="small" bsClass="btn-link pull-right" title="Collapse panel" onClick={this.uiSwitchPanelState}>
            <Glyphicon glyph={this.state.uiIsPanelCollapsed ? "collapse-down" : "collapse-up" } />
          </Button>
        </Panel.Heading>
        { this.state.uiIsPanelCollapsed ? "" : this.renderPanelBody() }
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
        {this.renderMainControls()}
        {this.state.uiShowComponentStateControls && this.renderComponentStateControls()}
      </Panel.Body>
    );
  }

  /**
   * Renders main component's controls
   * @returns {*}
   */
  renderMainControls() {
    let selected = "0";

    if (this.state.decksList) {
      selected = this.state.decksList.find(el => el.value === this.state.fileName);
      selected = (selected && selected.key) || "0";
    }

    return (
      <form>

        <FormGroup controlId="settingsFileName">
          <InputGroup>
            { this.state.fileExists && !!this.state.fileName.length ?
              <InputGroup.Button>
                <Button title="Locate">
                  <Glyphicon glyph="folder-open" />
                </Button>
              </InputGroup.Button>
              : "" }
            <FormControl
              type="text"
              value={this.state.fileName}
              onChange={this.setFileName}
            />
            <InputGroup.Button>
              <Button bsStyle="primary" disabled={this.state.fileName.length<1}>{this.state.fileExists?'Update deck':'Create deck'}</Button>
            </InputGroup.Button>
          </InputGroup>
        </FormGroup>


        <Form componentClass="fieldset" inline>

          <ButtonToolbar>
            <ToggleButtonGroup type="radio" name="options" defaultValue={1}>
              <ToggleButton value={1}>Radio 1 (pre-checked)</ToggleButton>
              <ToggleButton value={2}>Radio 2</ToggleButton>
              <ToggleButton value={3}>Radio 3</ToggleButton>
            </ToggleButtonGroup>

            {!!this.state.originalFileName &&
              <Button title="Restore original filename" disabled={this.state.fileName === this.state.originalFileName} onClick={this.restoreOriginalFilename}>
                <Glyphicon glyph="refresh" />
              </Button>}{' '}

            {!!this.state.decksList &&
              <FormControl
                componentClass="select"
                title="Take name from a deck"
                onChange={this.setFileNameFromDecks}
                value={selected}>
                <option key="0" value="0">Take name from a deck...</option>
                {this.state.decksList.map(el => <option key={el.key} value={el.key}>{el.value}</option>)}
              </FormControl>}
          </ButtonToolbar>
        </Form>
      </form>
    );
  }

  /**
   * Renders component state controls
   * @returns {*}
   */
  renderComponentStateControls() {
    return (
      <div>
        <Checkbox inline checked={!!this.state.originalFileName} onChange={this.switchStateOriginalFileName}>Orignal file exists</Checkbox>
        <Checkbox inline checked={this.state.fileExists} onChange={this.switchStateFileExists}>Destination exists</Checkbox>
      </div>
    );
  }

  // === Handlers

  /**
   * Handles fule name text input
   * @param {Event} ev
   */
  setFileName(ev) {
    this.setState({
      fileName: ev.target.value,
    });
  }

  /**
   * Handles selection from file names list
   * @param {Event} ev
   */
  setFileNameFromDecks(ev) {
    if (!!this.state.decksList) {
      const targetItem = this.state.decksList.find(el => el.key === ev.target.value);
      targetItem && this.setState({
        fileName: targetItem.value,
      });
    }
  }

  /**
   * Restores original file name
   */
  restoreOriginalFilename() {
    this.setState({
      fileName: this.state.originalFileName,
    });
  }

  // === General UI handlers
  /**
   * Switches component state: is there an original file name?
   */
  switchStateOriginalFileName() {
    this.setState({
      originalFileName: this.state.originalFileName ? null : 'Merge Google Slides Guide',
    });
  }

  /**
   * Switches component state: does destination file exist?
   */
  switchStateFileExists() {
    this.setState({fileExists: !this.state.fileExists})
  }

  /**
   * Switches panel state: collapsed or spread
   */
  uiSwitchPanelState() {
    this.setState({
      uiIsPanelCollapsed: !this.state.uiIsPanelCollapsed,
    });
  }
}
