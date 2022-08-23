import React from 'react';

import "../styles/Article.css"

function Article(props) {
    return (
        <a href={props.link} className='article-link'>
            <section className='article-box'>
                <div className='flex'>
                    <h3 className='article-title'>{props.title}</h3>
                    <p className='article-date'>{props.date}</p>
                </div>
                <p className='article-author'>{props.author}</p>
            </section>
        </a>
    );
}

export default Article;