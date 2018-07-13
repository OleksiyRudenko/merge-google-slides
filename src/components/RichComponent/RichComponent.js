import { Component } from 'react';
import * as xobject from '../../utils/xobject/xobject.js';

export default class RichComponent extends Component {
  /**
   * Logs debug message and optional parameters.
   * @param message
   * @param args
   * @private
   */
  _debug(message, ...args) {
    if (this.debug) {
      args = args.map(item => {
        return item !== null && typeof item === 'object'
          ? xobject.deepClone(item)
          : item;
      });
      console.log(this.constructor.name + ' ' + message + ' this.props, this.state:', xobject.deepClone(this.props), xobject.deepClone(this.state), ...args );
    }
  }
}
