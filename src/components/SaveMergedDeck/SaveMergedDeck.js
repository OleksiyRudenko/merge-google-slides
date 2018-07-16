import React from 'react';
import RichComponent from "../RichComponent";
import {
  Button, Glyphicon, Modal, ProgressBar
} from 'react-bootstrap';
import {bindHandlers} from "../../utils/bind";
import GSlidesService from "../../services/GSlidesService";
import SourceDecksService from "../../services/SourceDecksService";
import styles from './SaveMergedDeck.css';

export default class SaveMergedDeck extends RichComponent {
  constructor(props) {
    super(props);
    this.debug = true;
    this.state = {
      show: this.props.show,
      saveStatus: 'not-ready', // not-ready, ready, working, completed
      fileName: null,
      fileId: null,
      folderName: null,
      folderId: null,
      copyFirstSucceeded: false,
      tasks: null,
    };
    bindHandlers(this,
      'renderMain',
      'handleClose',
      'handleSave',
    );
    this._debug('.constructor()');
  }

  componentDidMount() {
    this._debug('.cDM()');
    if (this.state.show && !this.state.fileName) {
      this.updateDestination();
    }
  }

  componentDidUpdate() {
    this._debug('.cDU()');
    if (this.state.show && !this.state.fileName) {
      this.updateDestination();
    }
    // (this.state.show && this.state.fileName) || this.updateDestination();
  }

  /**
   * Renders component view
   */
  render() {
    return (
      <Modal show={this.state.show} onHide={this.handleClose}>
        <Modal.Header closeButton>
          <Modal.Title><Glyphicon glyph="save" /> Save resulting deck</Modal.Title>
        </Modal.Header>
        {this.renderMain()}
        <Modal.Footer>
          {this.state.saveStatus === 'done'
            ? this.state.copyFirstSucceeded
              ? <React.Fragment>
                <Button href={`https://drive.google.com/drive/u/0/folders/${this.state.folderId}`} target="_blank" rel="noopener noreferrer"
                        title="Open containing folder"
                >
                  <img src="./assets/Google-Drive-icon-x24.png" width="18" height="18" alt="Go to Google Drive" /> Open folder
                </Button>
                <Button href={`https://docs.google.com/presentation/d/${this.state.fileId}/edit`} target="_blank" rel="noopener noreferrer"
                        title={`Open ${this.state.fileName}`}
                >
                  <img src="./ico/favicon-32x32.png" width="18" height="18" alt="Slides file" /> {this._ellipsify(this.state.fileName)}
                </Button>
              </React.Fragment>
              : <span className={styles.taskFailed}><b>Failed to copy initial deck!</b> </span>
            : <Button bsStyle="primary" disabled={this.state.saveStatus !== 'ready'} onClick={this.handleSave}>
                {this.state.saveStatus === 'working'
                  ? <React.Fragment><div className={styles.spinner} /> Saving</React.Fragment>
                  : <React.Fragment><Glyphicon glyph="save" /> Save</React.Fragment>
                }
              </Button>
          }
          <Button onClick={this.handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }

  /**
   * Renders panel body
   * @returns {*}
   */
  renderMain() {
    return (
      <Modal.Body>
        <h4>Hi there!</h4>
        <p className="justified">
          This is still an alpha version of the app. Please, check the <b>Important note</b> on the main page for details.
          Please, come back after July 24, 2018 to check beta version.
        </p>
        <p className="justified"><b>NB!</b> All imported decks will inherit masters, notes master, layouts, page size, and locale from the first deck.
          Therefore the look of decks
          may vary from the original. At the moment of this app development Google Slides API (v.1) didn't offer
          methods to import additional masters, notes master, and layouts. Should the above information be out of date,
          please, submit a <a href="https://goo.gl/forms/G4zwJklIrxOP60ys1" target="_blank" title="Submit a bug report or suggestion" rel="noopener noreferrer">
            <span className="nobreak"><Glyphicon glyph="flash" />suggestion or bug report</span></a>.
        </p>
        {this.state.fileName
          ? <p className="justified">Resulting Slides file will be named <span className="nobreak"><b><code>{this.state.fileName}</code></b></span> and
            placed in a folder along with first source Slides deck.
          </p>
          : <ProgressBar striped bsStyle="info" now={100} active />
        }
        {this.state.tasks
          ? Object.keys(this.state.tasks).map((deckId, idx) => this.renderTaskStatus(deckId, idx))
          : ''
        }
      </Modal.Body>
    );
  }

  renderTaskStatus(deckId, key) {
    const task = this.state.tasks[deckId];

    let output = '';
    let className = styles.taskNeutral;
    let progress = '';

    if (task.error) {
      className = styles.taskFailed;
      output = task.failure;
    } else {
      if (task.completed === 100) {
        className = styles.taskSucceeded;
        output = task.done;
      } else {
        progress = (task.completed === 0)
          ? <ProgressBar active striped bsStyle="info" now={100} />
          : <ProgressBar bsStyle="success" now={task.completed} />;
        output = (task.completed === 0) ? task.toDo : task.doing;
      }
    }
    return (
      <div key={key} className={className}>
        {output}{progress}
      </div>
    );
  }

  /**
   * Handle close action
   */
  handleClose() {
    this.setState({
      show: false,
      saveStatus: 'not-ready', // not-ready, ready, working, completed
      fileName: null,
      fileId: null,
      folderName: null,
      folderId: null,
      copyFirstSucceeded: false,
      tasks: null,
    });
    this.props.handleClose();
  }

  updateDestination() {
    GSlidesService.getSuggestedDestination().then(destination => {
      this._debug('.updateDestination()', 'destination', destination);
      this.state.show && this.setState({
        fileName: destination.filename + ' (' + this.getCurrentDT() + ')',
        folderName: destination.parentFolder.name,
        folderId: destination.parentFolder.id,
        saveStatus: 'ready',
      });
    });
  }

  handleSave() {
    let targetFileId = null;
    let tasks = {};
    const deckIds = SourceDecksService.getDeckIds();
    this._debug('.handleSave()', 'deckIds', deckIds);
    if (deckIds.length) {
      this.setState({
        saveStatus: 'working',
      });
      // generate tasks
      Promise.all(deckIds.map(deckId => SourceDecksService.getDeck(deckId)))
        .then(decks => {
          deckIds.forEach((deckId, idx) => {
            const title = this._ellipsify(decks[idx].title);
            tasks[deckId] = {
              id: deckId,
              title: decks[idx].title,
              toDo: title + ' -- pending',
              doing: title + ' -- merging',
              done: title + ' -- merged',
              failure: title + ' -- failed to parse speaker notes',
              completed: 0,
              error: false,
            };
          });
          this._debug('.handleSave()', 'decks', decks, 'deckIds', deckIds, 'tasks', tasks);
          this.setState({
            tasks: Object.assign({}, tasks),
          });
          return true;
        })
      .then(done => {
        return done
          ? GSlidesService.copyDeck({
            fromDeckId: deckIds[0],
            fileName: this.state.fileName,
            parentFolderId: this.state.folderId,
          })
          : Promise.reject('SaveMergedDecks.handleSave() Unexpected termination!');
      })
      .then(file => {
        this._debug('.handleSave()', 'file', file);
        targetFileId = file.id;
        const firstSourceDeckId = deckIds[0];
        // update copy task
        tasks[firstSourceDeckId] = Object.assign(tasks[firstSourceDeckId], {
          completed: 100,
        });
        this.setState({
          tasks: Object.assign({}, tasks),
          copyFirstSucceeded: true,
        });
        // merge the remaining decks
        return deckIds.length ? GSlidesService.mergeDecks(file.id, deckIds.slice(1)) : 'Single source deck processed';
      }).then(result => {
        this._debug('.handleSave()', 'merger result', result);
        // TODO: add real state
        deckIds.forEach((deckId, idx) => {
          if (idx) {
            tasks[deckId] = Object.assign(tasks[deckId], {
              error: true,
            });
          }
        });
        this.setState({
          tasks: Object.assign({}, tasks),
        });
        // set process finished
        this.setState({
          saveStatus: 'done',
          fileId: targetFileId,
        });
      }).catch(err => {
        // ERRORS
        deckIds.forEach((deckId, idx) => {
          if (idx && tasks[deckId].completed < 100) {
            tasks[deckId] = Object.assign(tasks[deckId], {
              error: true,
            });
          }
        });
        this.setState({
          tasks: Object.assign({}, tasks),
          saveStatus: 'done',
        });
        console.error('!!!!! SaveMergedDecks.handleSave() ERROR', err);
      });
    }
  }

  getCurrentDT() {
    const d = new Date();
    return [ d.getFullYear(), this.pad(d.getMonth() + 1), this.pad(d.getDate()) ].join('-') +
      ' ' + [this.pad(d.getHours()), this.pad(d.getMinutes()), this.pad(d.getSeconds()) ].join('-');
  }

  pad(str) {
    return str.toString().padStart(2, '0');
  }


  _ellipsify(str, len = 24) {
    return str.length > len
      ? str.substr(0, len - 3) + '…'
      : str;
  }
}
