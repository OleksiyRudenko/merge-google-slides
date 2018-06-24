import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Image, MenuItem,  Navbar, Nav, NavDropdown, NavItem, } from 'react-bootstrap';
import logo from './merge-google-slides.png';
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
        <React.Fragment>
          {this.renderNavbar()}
          <Route path="/" component={Dashboard} />
        </React.Fragment>
      </Router>
    );
  }

  renderNavbar() {
    return (
      <Navbar inverse fixedTop>
        <Navbar.Header>
          <Navbar.Brand>
            <Image src={logo} alt="Merge Google Slides logo" />
            Merge Google Slides
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Nav>
            <NavDropdown eventKey={1} title="Docs" id="basic-nav-dropdown">
              <MenuItem href="https://react-bootstrap.github.io/components/navbar/" target="_blank">
                Privacy Policy
              </MenuItem>
              <MenuItem href="http://getbootstrap.com/components/#glyphicons" target="_blank">
                Terms of Service
              </MenuItem>
            </NavDropdown>
            <NavItem href="https://github.com/OleksiyRudenko/merge-google-slides" target="_blank">
              GitHub
            </NavItem>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default App;
