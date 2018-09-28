import React, { Component } from 'react';
import './createAccountOverlay.css'
import PropTypes from 'prop-types';
import axios from 'axios';

class CreateAccountOverlay extends Component {
  state = {
    caResponse: ''
  }

  updateUsernameInput = (e) => {
    this.setState({ usernameInput: e.target.value });
  }

  updateEmailInput = (e) => {
    this.setState({ emailInput: e.target.value });
  }

  updatePasswordInput = (e) => {
    this.setState({ passwordInput: e.target.value });
  }

  updateConfirmPasswordInput = (e) => {
    this.setState({ confirmPasswordInput: e.target.value });
  }

  render() {
    const { exitCreate, openLoginOverlay } = this.props;

    return (
      <div>
        <div className="caOverlay" onClick={exitCreate}></div>
        <div className="caCredentialsBox">
          <form className="caCredentialsForm">
            <fieldset className="caCredentialsFieldset">
              <legend>Create a Paint Gauge Account</legend>
              Username:<br />
              <input type="text" placeholder="username" id="usernameInput" onChange={this.updateUsernameInput} /><br />
              Email:<br />
              <input type="text" placeholder="email" id="emailInput" onChange={this.updateEmailInput} /><br />
              Password:<br />
              <input type="password" placeholder="password" id="passwordInput" onChange={this.updatePasswordInput} /><br />
              Confirm Password:<br />
              <input type="password" placeholder="password" id="confirmPasswordInput" onChange={this.updateConfirmPasswordInput} /><br />
              <br />
              <button type="button" id="submitButton" onClick={this.tryCreateAccount}>Create Account</button><br />
              <span>Already have an account?</span><br />
              <span onClick={openLoginOverlay} id="caLoginText">Login here</span>
            </fieldset>
            <div className="caResponseBox">{this.state.caResponse}</div>
          </form>
        </div>
      </div>
    )
  }

  tryCreateAccount = () => {
    //Validate passwords match, email is an email
    if (this.state.passwordInput !== this.state.confirmPasswordInput || this.state.password === '') {
      this.setState({ caResponse: 'Your passwords must match an not be empty.' });
      return;
    }

    //Get npm package for verifying an email

    axios.post('/api/registerUser', {
      username: this.state.usernameInput,
      password: this.state.passwordInput,
      email: this.state.emailInput
    })
      .then((response) => {
        console.dir(response);
        this.setState({ caResponse: response.data.message });

        if (response.status === 200) {
          // Need to add some display that indicates the account was created before closing overlay

          this.props.exitCreate();
        }
      })
      .catch((err) => {
        if (err.response) {
          console.dir(err.response);
          this.setState({ caResponse: err.response.data.message });
        }
      });
  }
}

CreateAccountOverlay.propTypes = {
  exitCreate: PropTypes.func,
  openLoginOverlay: PropTypes.func
};

export default CreateAccountOverlay;
