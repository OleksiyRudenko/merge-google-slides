import React, { Component } from 'react';
import { ProgressBar } from 'react-bootstrap';
import styles from "./ScrollingText.css";

export default class ScrollingText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      textData: this.props.textData,
      isScrolling: true,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log('ScrollingText.cDU() props,state,prevProps,prevState', this.props, this.state, prevProps, prevState);
    if (this.props.textData) {
      // remove scrolling class if <p> width is lesser than <div> width
      setTimeout(() => {
        const stcw = document.getElementById('stc' + this.props.idBase).clientWidth;
        const sttw = document.getElementById('stt' + this.props.idBase).offsetWidth;
        if (stcw > sttw) {
          this.setState({
            isScrolling: false,
          });
        }
        // console.log('ScrollingText.cDU()', this.props.textData, stcw, sttw);
      }, 300);
    }
  }

  /**
   * Renders component view
   */
  render() {
    // console.log('ScrollingText.render()', this.state, this.props);
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
