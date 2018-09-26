import React, { Component } from 'react';
import './loginOverlay.css'
import PropTypes from 'prop-types';
import axios from 'axios';

class LoginOverlay extends Component {
  state = {
    loginResponse: ''
  }

  updateUsernameInput = (e) => {
    this.setState({usernameInput: e.target.value});
  }

  updatePasswordInput = (e) => {
    this.setState({passwordInput: e.target.value});
  }

  render() {
    const { exitLogin, createAccount } = this.props;

    return (
      <div>
        <div className="loginOverlay" onClick={exitLogin}></div>
        <div className="credentialsBox">
          <form className="credentialsForm">
            <fieldset className="credentialsFieldset">
              <legend>Sign In to Paint Gauge</legend>
              Username:<br />
              <input type="text" name="username" id="usernameInput" onChange={this.updateUsernameInput} /><br />
              Password:<br />
              <input type="password" name="password" id="passwordInput" onChange={this.updatePasswordInput} /><br />
              <br />
              <button type="button" id="submitButton" onClick={this.attemptSignIn}>Sign In</button><br />
              <span>Don't have an account?</span><br/>
              <span onClick={createAccount} id="createAccountText">Create Account</span>
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
      this.setState({loginResponse: response.data.message});
      console.dir(response.state.loginResponse);
      console.dir(this.state.loginResponse);

      if (response.status === 200) {
        this.props.exitLogin();
      }
    })
    .catch((err) => {
      if (err.response) {
        console.dir(err.response.data.message);
      }
    });
    /*
    const response = fetch('/api/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username, password: this.state,
      })
    });

    const body = await response.json().catch(console.log(response))
      .then(this.ratingComponent.resetStars());

    if (response.status !== 200)
      throw Error(body.message);

    this.setState({response});
    */
  }
}



LoginOverlay.propTypes = {
  exitLogin: PropTypes.func,
  createAccount: PropTypes.func,
  visible: PropTypes.bool
};

export default LoginOverlay;