import React, { Component } from 'react';
import './paintcarousel.css'
import PropTypes from 'prop-types';

class PaintCarousel extends Component {
    componentDidMount() {
      
    }

    //When the image .onload is called,
    //check the .complete property until it is set to true
    //Unlock the rating afterwards
    delayedUnlock = () => {
        setTimeout(() => { this.props.unlockRating(); }, 500);
    }

    render() {
        const { artName, imageSrc, unlockRating } = this.props;

        return (
            <div>
                <div className="carouselContainer">
                  <img id="ci" className="carouselImage" src={imageSrc} alt={artName} onLoad={unlockRating}/>
                </div>
            </div>
        )
    }
}

PaintCarousel.propTypes = {
    artName: PropTypes.string,
    imageSrc: PropTypes.string,
    unlockRating: PropTypes.func
};

export default PaintCarousel;
