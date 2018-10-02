import React, { Component } from 'react';
import './loginOverlay.css'
import PropTypes from 'prop-types';
import axios from 'axios';

class LoginOverlay extends Component {
  state = {
    loginResponse: ''
  }

  updateUsernameInput = (e) => {
    this.setState({ usernameInput: e.target.value });
  }

  updatePasswordInput = (e) => {
    this.setState({ passwordInput: e.target.value });
  }

  render() {
    const { exitLogin, openCreateOverlay } = this.props;

    return (
      <div>
        <div className="loginOverlay" onClick={exitLogin}></div>
        <div className="loginCredentialsBox">
          <form className="loginCredentialsForm">
            <fieldset className="loginCredentialsFieldset">
              <legend>Sign In to Paint Gauge</legend>
              Username:<br />
              <input type="text" placeholder="username" id="usernameInput" onChange={this.updateUsernameInput} /><br />
              Password:<br />
              <input type="password" placeholder="password" id="passwordInput" onChange={this.updatePasswordInput} /><br />
              <br />
              <button type="button" id="submitButton" onClick={this.attemptSignIn}>Sign In</button><br />
              <span>Don't have an account?</span><br />
              <span onClick={openCreateOverlay} id="createAccountText">Create Account</span>
            </fieldset>
            <div className="loginResponseBox">{this.state.loginResponse}</div>
          </form>
        </div>
      </div>
    )
  }

  attemptSignIn = () => {
    axios.post('/api/login', {
      username: this.state.usernameInput,
      password: this.state.passwordInput
    })
      .then((response) => {
        console.dir(response);
        this.setState({ loginResponse: response.data.message });

        if (response.status === 200) {
          this.props.setLoginStates(response.data.username, response.data.token);
          this.props.exitLogin();
        }
      })
      .catch((err) => {
        if (err.response) {
          console.dir(err.response.data.message);
          this.setState({ loginResponse: err.response.data.message });
        }
      });
  }
}

LoginOverlay.propTypes = {
  exitLogin: PropTypes.func,
  openCreateOverlay: PropTypes.func,
  setLoginStates: PropTypes.func
};

export default LoginOverlay;
