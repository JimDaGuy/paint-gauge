import React, { Component } from 'react';
import './paintcarousel.css'
import PropTypes from 'prop-types';
import { Spinner } from 'spin.js'

const loadingSpinnerOptions = {
    lines: 12, // The number of lines to draw
    length: 0, // The length of each line
    width: 29, // The line thickness
    radius: 45, // The radius of the inner circle
    scale: 1, // Scales overall size of the spinner
    corners: 1, // Corner roundness (0..1)
    color: '#63af50', // CSS color or array of colors
    fadeColor: 'transparent', // CSS color or array of colors
    speed: 1.2, // Rounds per second
    rotate: 0, // The rotation offset
    animation: 'spinner-line-fade-default', // The CSS animation name for the lines
    direction: 1, // 1: clockwise, -1: counterclockwise
    zIndex: 2e9, // The z-index (defaults to 2000000000)
    className: 'spinner', // The CSS class to assign to the spinner
    top: '50%', // Top position relative to parent
    left: '50%', // Left position relative to parent
    shadow: '0 0 1px transparent', // Box-shadow for the lines
    position: 'absolute' // Element positioning
};

class PaintCarousel extends Component {
    constructor(props) {
        super(props);
        this.artName = props.artName;
        this.imageSrc = props.imageSrc;
    }

    componentDidMount() {
        var spinnerTarget = document.getElementById('loadingSpinner');
        var spinner = new Spinner(loadingSpinnerOptions).spin(spinnerTarget);
        spinner.spin();
    }

    stopSpinner = () => {
        //spinner.stop();
    }

    startSpinner = () => {
        //spinner.spin();
    }

    render() {
        return (
            <div>
                <img className="carouselImage" src={this.props.imageSrc} alt={this.props.artName} />
            </div>
        )
    }
}

PaintCarousel.propTypes = {
    artName: PropTypes.string,
    imageSrc: PropTypes.string
};

export default PaintCarousel;
