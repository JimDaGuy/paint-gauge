import React, { Component } from 'react';
import './header.css'
import PropTypes from 'prop-types';

class Header extends Component {
    render() {
      const { loggedIn, username, openLogin } = this.props;

      let signInSection;
      
      if (loggedIn) {
        signInSection = 
          <div className="signInSection">
            <span>Signed in as {username} </span>
            <a href="/logout">Sign Out</a>
          </div>;
      } else {
        signInSection = 
          <div className="signInSection">
            <span>Continue as Guest or </span>
            <span onClick={openLogin} id="signInText">Sign In</span>
          </div>;
      }

        return (
            <header className="header">
                <h1 className="topH1">PaintGauge</h1>
                {signInSection}
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