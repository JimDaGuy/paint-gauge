import React, { Component } from 'react';
import './ratings.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types';

class Ratings extends Component {
    getValue = () => {
        return this.value;
    }

    highlightStars = (value) => {
        var stars = document.getElementsByClassName('star');

        Array.prototype.forEach.call(stars, (star) => {
            var starValue = star.attributes.value.value;

            if (value >= starValue) {
                star.style.color = "yellow";
            }
        });
    }

    resetStars = () => {
        var stars = document.getElementsByClassName('star');

        Array.prototype.forEach.call(stars, (star) => {
            star.style.color = "black";
        });
    }

    render() {
        const { artName, sendRating } = this.props;

        return (
            <div className="ratingBar">
                <h2 className="ratingH1">{artName}</h2>
                <FontAwesomeIcon className="star" icon={faStar} value="1" onClick={() => sendRating(1)} />
                <FontAwesomeIcon className="star" icon={faStar} value="2" onClick={() => sendRating(2)} />
                <FontAwesomeIcon className="star" icon={faStar} value="3" onClick={() => sendRating(3)} />
                <FontAwesomeIcon className="star" icon={faStar} value="4" onClick={() => sendRating(4)} />
                <FontAwesomeIcon className="star" icon={faStar} value="5" onClick={() => sendRating(5)} />
            </div>
        )
    }
}

Ratings.propTypes = {
    artName: PropTypes.string,
    sendRating: PropTypes.func,
    locked: PropTypes.bool
};

export default Ratings;