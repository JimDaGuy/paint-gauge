import React, { Component } from 'react';
import './header.css'
import PropTypes from 'prop-types';

class Header extends Component {
    render() {
      const { loggedIn, username } = this.props;

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
            <a href="/login">Sign In</a>
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
  iusername: PropTypes.string
};

export default Header;