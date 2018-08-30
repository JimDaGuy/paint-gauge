import React, { Component } from 'react';
import Header from './components/header.js'
import PaintCarousel from './components/paintcarousel.js'
import Ratings from './components/ratings.js'
import './App.css';

class App extends Component {
  state = {
    imageSrc: '',
    artName: '',
    id: '',
    locked: true,
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({
        imageSrc: res.primaryimageurl + '?width=450',
        artName: res.title,
        id: res.id
      }))
      .catch(err => {
        throw err;
      });
  }

  callApi = async () => {
    const response = await fetch('/api/getRandomPainting');

    const body = await response.json()
      .then(this.ratingComponent.resetStars())
      .then(this.state.locked = false);

    if (response.status !== 200)
      throw Error(body.message);

    return body;
  };

  //Send a rating for the current painting and grab a new painting
  sendRating = async (e) => {
    //Don't send a rating if the component is locked
    if (this.state.locked)
      return;

    //Return from the function if FontAwesome is a little weird and the parent element is missing
    if (e.target.parentElement.nodeName !== 'svg')
      return;

    //Weird way to get value attribute because I'm using FontAwesome icons
    var rating = e.target.parentElement.attributes.value.value;
    var id = this.state.id;
    var artName = this.state.artName;

    //Highlight stars in the rating component
    this.ratingComponent.highlightStars(rating);

    //Lock the rating component to prevent sending ratings before a new image has loaded
    this.setState({
      locked: true
    });

    //Send a POST to the API with the rating, id, and name of the art
    await fetch('/api/sendRating', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rating: rating,
        id: id,
        artName: artName
      })
    });

    //Get a new painting to display after sending out a rating
    this.getNewPainting();
  }

  getNewPainting = () => {
    this.callApi()
      //Set the state with results from the API and unlock the rating component
      .then(res => this.setState({
        imageSrc: res.primaryimageurl + '?width=450',
        artName: res.title,
        id: res.id,
        locked: false
      }))
      .catch(err => {
        throw err;
      });
  }

  render() {
    return (
      <div className="App">
        <Header />
        <PaintCarousel locked={this.state.locked} imageSrc={this.state.imageSrc} artName={this.state.artName} />
        <Ratings ref={instance => { this.ratingComponent = instance; }} artName={this.state.artName} sendRating={this.sendRating} />
      </div>
    );
  }
}

export default App;
