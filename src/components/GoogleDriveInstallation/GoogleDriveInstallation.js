import React, { Component } from 'react';
import queryString from 'qs';
// import "./GoogleDriveInstallation.css";
// import {bindHandlers} from "../../utils/bind";

export default class GoogleDriveInstallation extends Component {
  constructor(props) {
    super(props);
    this.installationCodeParamName = this.props.gapi.gapiParams.gDrive.installationCodeParamName;
    const defaultGDriveInstallationParam = {};
    defaultGDriveInstallationParam[this.installationCodeParamName] = null;
    const urlParams = this.props.location.search ? queryString.parse(this.props.location.search.slice(1)) : defaultGDriveInstallationParam;
    this.state = {
      urlParams: urlParams,
    };
    // bindHandlers(this, '');
    console.log('GoogleDriveInstallation::props, state, installation URL', this.props, this.state, this.props.gapi.getGDriveInstallationUrl());
  }

  componentDidMount() {
    console.log('GoogleDriveInstallation.cDM()');
  }

  componentDidUpdate() {
    console.log('GoogleDriveInstallation.cDU()');
  }

  /**
   * Renders component view
   */
  render() {
    console.log('GoogleDriveInstallation.render()', this.state);
    return (
      <React.Fragment>
        <h4>Installation</h4>
      </React.Fragment>
    );
  }
}
