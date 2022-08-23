import React from 'react';

import "../styles/Loading.css"

function Loading(props) {
    return (
        <div className='loading-container'>
            <section className='loading-box'>
                <div className='flex'>
                    <h3 className='loading-title loading'>Loading...</h3>
                    <p className='loading-date loading'>Loading...</p>
                </div>
                <p className='loading-author loading'>Loading...</p>
            </section>
        </div>
    );
}

export default Loading;