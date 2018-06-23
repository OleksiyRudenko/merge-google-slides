import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
// import logo from './logo.svg';
import './App.css';
import Dashboard from './components/Dashboard';

class App extends Component {
  constructor(props) {
    super(props);
    // console.log('App: ', GapiService);
  }
  render() {
    return (
      <Router>
        <div>
          <Route path="/" component={Dashboard} />
        </div>
      </Router>
    );
    /* return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Merge Google Slides</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    ); */
  }
}

export default App;
