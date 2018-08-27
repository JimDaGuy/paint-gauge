import React, { Component } from 'react';
import './paintcarousel.css'
import PropTypes from 'prop-types';

class PaintCarousel extends Component {
    constructor(props) {
        super(props);
        this.artName = props.artName;
        this.imageSrc = props.imageSrc;
    }

    render () {
        return(
            <div>
                <img className="carouselImage" src={this.props.imageSrc} alt={this.props.artName}/>
            </div>
        )
    }
}

PaintCarousel.propTypes = {
    artName: PropTypes.string,
    imageSrc: PropTypes.string
};

export default PaintCarousel;
    