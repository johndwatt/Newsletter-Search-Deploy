import React from 'react';

import "../styles/NoArticles.css"

function NoArticles(props) {
    return (
        <div className='no-articles'>
            <h3>No articles found with that search criteria.</h3>
            <p>You could try different search terms.</p>
        </div>
    );
}

export default NoArticles;