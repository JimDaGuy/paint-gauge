import React, { Component } from 'react';
import Header from '../components/header.js'
import PaintCarousel from '../components/paintcarousel.js'
import Ratings from '../components/ratings.js'
import LoginOverlay from '../components/loginOverlay.js';
import CreateAccountOverlay from '../components/createAccountOverlay.js';

class Home extends Component {
  state = {
    imageSrc: '',
    artName: '',
    paintingID: '',
    locked: true,
    loggingIn: false,
    creatingAccount: false,
    loggedIn: false,
    expired: false,
    username: 'default',
  };

  componentDidMount() {
    // Set state based on localstorage
    const loggedIn = localStorage.getItem('loggedIn');
    const expired = localStorage.getItem('expired');
    const username = localStorage.getItem('username');

    if (loggedIn === 'true') {
      this.setState({ loggedIn: true });

      if (expired === 'true') {
        this.setState({ expired: true });
      }

      this.setState({ username });
    }

    this.getPainting()
      .then(res => this.setState({
        imageSrc: res.primaryimageurl + '?width=450',
        artName: res.title,
        paintingID: res.id
      }))
      .catch(err => {
        throw err;
      });
  };

  getPainting = async () => {

    const response = await fetch('/api/getRandomPainting');

    const body = await response.json().catch(console.log(response))
      .then(this.ratingComponent.resetStars());

    if (response.status !== 200)
      throw Error(body.message);

    return body;
  };

  //Send a rating for the current painting and grab a new painting
  sendRating = async (ratingNum) => {
    //Don't send a rating if the component is locked
    if (this.state.locked || this.state.expired)
      return;

    //Highlight stars in the rating component
    this.ratingComponent.highlightStars(ratingNum);

    //Lock the rating component to prevent sending ratings before a new image has loaded
    this.setState({ locked: true });

    //Send a POST to the API with the rating, id, and name of the art
    await fetch('/api/sendRating', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: ratingNum,
        paintingID: this.state.paintingID,
        token: localStorage.getItem('jwToken')
      })
    }).then((response) => {
      // Token invalid or expired 
      if (response.status === 401) {
        console.dir(response);
        // Set state to expired
        this.setState({ expired: true });
        localStorage.setItem('expired', true);
        // Display window for user to re-authenticate
        
        return;
      }
      //Get a new painting to display after sending out a rating
      this.getNewPainting();
    }).catch((err) => {
      console.dir(err);
      
    });


  }

  getNewPainting = () => {
    this.getPainting()
      //Set the state with results from the API and unlock the rating component
      .then(res => this.setState({
        imageSrc: res.primaryimageurl + '?width=450',
        artName: res.title,
        paintingID: res.id
      }))
      .catch(err => {
        throw err;
      });
  }

  unlockRating = () => {
    this.setState({ locked: false });
  }

  openLogin = () => {
    this.setState({ loggingIn: true, creatingAccount: false });
  }

  openCreateAccount = () => {
    this.setState({ loggingIn: false, creatingAccount: true });
  }

  closeOverlays = () => {
    this.setState({ loggingIn: false, creatingAccount: false });
  }

  signOut = () => {
    // Set loggedIn state to false and username to default
    this.setState({ loggedIn: false, username: 'default', expired: false, token: '' });
    // Clear localstorage on logout
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('expired');
    localStorage.removeItem('username');
    localStorage.removeItem('jwToken');
  }

  setLoginStates = (username, token) => {
    this.setState({ loggedIn: true, expired: false, username, token });
    // Store info in localStorage
    localStorage.setItem('jwToken', token);
    localStorage.setItem('loggedIn', true);
    localStorage.setItem('expired', false);
    localStorage.setItem('username', username);
  }

  render() {
    return (
      <div className="App">
        {this.state.loggingIn ? <LoginOverlay exitLogin={this.closeOverlays} openCreateOverlay={this.openCreateAccount} setLoginStates={this.setLoginStates} /> : ''}
        {this.state.creatingAccount ? <CreateAccountOverlay exitCreate={this.closeOverlays} openLoginOverlay={this.openLogin} /> : ''}
        <Header loggedIn={this.state.loggedIn} username={this.state.username} openLogin={this.openLogin} signOut={this.signOut} />
        <PaintCarousel locked={this.state.locked} imageSrc={this.state.imageSrc} artName={this.state.artName} unlockRating={this.unlockRating} />
        <Ratings ref={instance => { this.ratingComponent = instance; }} artName={this.state.artName} sendRating={this.sendRating} />
      </div>
    )
  }
}

export default Home;