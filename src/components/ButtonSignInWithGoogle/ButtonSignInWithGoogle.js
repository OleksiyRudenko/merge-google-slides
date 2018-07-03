import React, { Component } from 'react';

export default class ButtonSignInWithGoogle extends Component {
  /**
   * Renders component view
   */
  render() {
    return (
      <div id={this.props.targetId || "g-signin2"} />
    );
  }
}
