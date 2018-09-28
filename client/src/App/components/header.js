import React, { Component } from 'react';
import './header.css'
import PropTypes from 'prop-types';

class Header extends Component {
  render() {
    const { loggedIn, username, openLogin } = this.props;

    const signInDiv = (
      <div className="signInSection">
        <span>Continue as Guest or </span>
        <span onClick={openLogin} id="signInText">Sign In</span>
      </div>
    );

    const signedInDiv = (
      <div className="profileDivSection">
        <span>Signed in as {username} </span>
        <a href="/logout">Sign Out</a>
      </div>
    );

    return (
      <header className="header">
        <h1 className="topH1">PaintGauge</h1>
        {loggedIn ? signedInDiv : signInDiv}
      </header>
    )
  }
}

Header.propTypes = {
  loggedIn: PropTypes.bool,
  username: PropTypes.string,
  openLogin: PropTypes.func
};

export default Header;