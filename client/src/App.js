import React, { Component } from 'react';
import Header from './components/header.js'
import PaintCarousel from './components/paintcarousel.js'
import Ratings from './components/ratings.js'
import './App.css';

class App extends Component {
  state = {
    imageSrc: '',
    artName: '',
    id: ''
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
    const body = await response.json();

    if (response.status !== 200) throw Error(body.message);

    return body;
  };

  sendRating = async (e) => {
    //console.dir(e.target.parentElement.nodeName)

    if (e.target.parentElement.nodeName !== 'svg')
      return;

    console.dir(e.target.parentElement)

    var rating = e.target.parentElement.attributes.value.value;
    var id = this.state.id;
    var artName = this.state.artName;

    //console.log(`Set rating to: ${rating}, id:${id}, name:${artName}`);

    //const post = 
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

    //post.res

    this.getNewPainting();
  }

  getNewPainting = () => {
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

render() {
  return (
    <div className="App">
      <Header />
      <PaintCarousel imageSrc={this.state.imageSrc} artName={this.state.artName} />
      <Ratings artName={this.state.artName} sendRating={this.sendRating} />
    </div>
  );
}
}

export default App;
