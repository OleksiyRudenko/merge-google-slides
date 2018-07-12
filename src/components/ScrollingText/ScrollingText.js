import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import styles from "./ScrollingText.css";

export default class ScrollingText extends Component {
  static defaultProps = {
    idBase: undefined,
    textData: undefined,
  };

  constructor(props) {
    super(props);
    this.debug = false;
    this.state = {
      isScrolling: true,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.textData !== prevState.prevTextData) {
      return {
        isScrolling: true,
        prevTextData: nextProps.textData,
      };
    }
    return null;
  }

  componentDidUpdate(prevProps, prevState) {
    this.debug && console.log('ScrollingText.cDU() props,state,prevProps,prevState', this.props, this.state, prevProps, prevState);
    if (this.props.textData) {
      // remove scrolling class if <p> width is lesser than <div> width
      this.timeoutId = setTimeout(function () {
        const stc = document.getElementById('stc' + this.props.idBase);
        const stt = document.getElementById('stt' + this.props.idBase);
        if (stc && stt) {
          const stcw = stc.clientWidth;
          const sttw = stt.offsetWidth;
          this.debug && console.log('ScrollingText.cDU() setTimeout() elements are in DOM', this.props.textData, stcw, sttw);
          if (stcw > sttw) {
            this.debug && console.log('ScrollingText.cDU() setTimeout() change state', this.state, this.props.textData, stcw, sttw);
            this.setState({
              isScrolling: false,
            });
          }
        } else {
          console.error('ScrollingText.cDU() -- targeted elements do not exist anymore!', stc, stt);
        }
        this.timeoutId = null;
      }.bind(this), 300);
    }
  }

  componentWillUnmount() {
    // cancel timeOut
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId);
    }
  }

  /**
   * Renders component view
   */
  render() {
    this.debug && console.log('ScrollingText.render()', this.state, this.props);
    return (
      <div id={'stc' + this.props.idBase} className={styles.scrollingTextContainer}>
        {this.props.textData
          ? <p id={'stt' + this.props.idBase} className={this.state.isScrolling ? styles.scrollingText : styles.steadyText}>
              {this.props.textData}
            </p>
          : <ProgressBar striped bsStyle="info" now={100} active className={styles.noBottomMargin} />}
      </div>
    );
  }
}
