import React, { Component } from 'react';
import './ratings.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types';

class Ratings extends Component {
    constructor(props) {
        super(props);
        this.artName = props.artName;
        this.sendRating = props.sendRating.bind(this);
    }

    getValue = () => {
        return this.value;
    }

    render() {
        return (
            <div className="ratingBar">
                <h2 className="ratingH1">{this.props.artName}</h2>
                <FontAwesomeIcon icon={faStar} value="1" onClick={ e => this.props.sendRating(e)}/>
                <FontAwesomeIcon icon={faStar} value="2" onClick={ e => this.props.sendRating(e)}/>
                <FontAwesomeIcon icon={faStar} value="3" onClick={ e => this.props.sendRating(e)}/>
                <FontAwesomeIcon icon={faStar} value="4" onClick={ e => this.props.sendRating(e)}/>
                <FontAwesomeIcon icon={faStar} value="5" onClick={ e => this.props.sendRating(e)}/>
            </div>
        )
    }
}

Ratings.propTypes = {
    artName: PropTypes.string,
    sendRating: PropTypes.func
};

export default Ratings;