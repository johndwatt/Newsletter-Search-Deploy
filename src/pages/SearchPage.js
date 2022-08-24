import React, { useState } from 'react';
import { API_URL } from "../api/api_connection";

import Article from '../components/Article';
import Loading from '../components/Loading';
import NoArticles from '../components/NoArticles';

import "../styles/SearchPage.css";

const URL = `${API_URL}/pages?_fields=id,title,link,date,content`

function SearchPage(props) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [pp1Checked, setpp1Checked] = useState(false);
    const [pp2Checked, setpp2Checked] = useState(false);
    const [pp3Checked, setpp3Checked] = useState(false);
    const [err, setErr] = useState(null);

    /**
     * Formats ISO-8601 date string to display year and abbreviated month (three characters). Converts string to date object, then formats with string interpolation. 
     * @param {String} str Date string in ISO-8601 format. Example: "2022-07-20T08:32:39".
     * @returns Formatted date string as "Mon Year". 
     */
    const formatDateStr = function (str) {
        const dateObj = new Date(str);
        let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug", "Sep", "Oct", "Nov", "Dec"];
        return `${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
    }
    
    /**
     * Formats author string from Wordpress page content using regex.
     * @param {String} str Large block of Wordpress HTML content in string format.
     * @param {String} title Wordpress rendered title string.
     * @returns String with extracted author name, "Other" for select pages, or "Spotlight" if no author is found. 
     */
    const formatAuthorStr = function (str, title) {
        let author = str.match(/<em>by(.*?)</i);
        let match = title.match(/Issue ([0-9]{1,3})/gi);
        if (author) {
            return `by ${author[1]}`
        } else if (match ||
                   title === "Calendar" || 
                   title === "Newsletter") {
            return "Overview";
        } else if (title === "Workshops" ||
                   title === "Conference Presentations" ||
                   title === "Contact Us" ||
                   title === "How to Join" ||
                   title === "Team Members" ||
                   title === "Home" ||
                   title === "Research" ||
                   title === "POES" ||
                   title === "Newsletter Search"){
            return "Other";
        } else {
            return "Spotlight";
        }
    }

    /**
     * Formats title string from Wordpress page content using regex to remove special HTML entities. Does not work for non-numeric entities.
     * @param {String} str Rendered Title from Wordpress.
     * @returns String with all special HTML entities decoded. 
     */
    const formatTitleStr = function (str) {
        return str.replace((/&#([0-9]{1,5});/gi), function(match, nums) {
            let num = parseInt(nums, 10);
            return String.fromCharCode(num);
        });
    }

    /**
     * Sets search query to value of search input on page.
     * @param {Object} e Event Object.
     */
    const handleSearchInput = (e) => {
        setSearch(e.target.value);
    }

    /**
     * Sets the number of articles to load to first radio option.
     * @param {Object} e Event Object.
     */
    const handlePerPageInput1 = (e) => {
        setPerPage(e.target.value);
        setpp1Checked(true);
        setpp2Checked(false);
        setpp3Checked(false);
    }

    /**
     * Sets the number of articles to load to second radio option.
     * @param {Object} e Event Object.
     */
    const handlePerPageInput2 = (e) => {
        setPerPage(e.target.value);
        setpp1Checked(false);
        setpp2Checked(true);
        setpp3Checked(false);
    }

    /**
     * Sets the number of articles to load to third radio option.
     * @param {Object} e Event Object.
     */
    const handlePerPageInput3 = (e) => {
        setPerPage(e.target.value);
        setpp1Checked(false);
        setpp2Checked(false);
        setpp3Checked(true);
        
    }

    /**
     * Sends request to Wordpress REST API with search query and loads formatted returned articles.
     * @param {Object} e Event object.
     */
    const handleSearch = async (e) => {
        try {
            e.preventDefault();

            setLoading(true);
    
            let response = await fetch(`${URL}&search=${search}&per_page=${perPage}`);
            let data = await response.json();
            let dataMod = await data.map((article) => {
                return {
                    date: formatDateStr(article.date),
                    title: formatTitleStr(article.title.rendered),
                    author: formatAuthorStr(article.content.rendered, article.title.rendered),
                    link: article.link,
                    id: article.id,
                } 
            });

            setPage(1);
            setSubmitted(true);
            setArticles(dataMod);
            setLoading(false);
        } catch (error) {
            setLoading(false);
            if (error.message === "data.map is not a function") {
                setErr("Current page and results per page mismatch. Do not change results per page when not on the first page.");
            } else {
                setErr(error.message);
            }
            console.log(error);
        }
    }
    
    /**
     * Clears search state/input and resets all other state to initial load values.
     * @param {Object} e Event Object.
     */
    const handleClearSearch = async (e) => {
        e.preventDefault();

        setLoading(true);
        setSearch("");
        setPage(1);
        setPerPage(20);
        setpp1Checked(false);
        setpp2Checked(false);
        setpp3Checked(false);
        setErr(null);
        setSubmitted(false);
        setArticles([]);
        setLoading(false);
    }

    /**
     * Sends request to Wordpress REST API with search query to get the next page of articles and format them.
     * @param {Object} e Event Object.
     */
    const handleNextPage = async (e) => {
        try {
            e.preventDefault();

            setLoading(true);

            let response = await fetch(`${URL}&search=${search}&page=${page+1}&per_page=${perPage}`);
            let data = await response.json();
            if (response.status === 200) {
                let dataMod = await data.map((article) => {
                    return {
                        date: formatDateStr(article.date),
                        title: formatTitleStr(article.title.rendered),
                        author: formatAuthorStr(article.content.rendered, article.title.rendered),
                        link: article.link,
                        id: article.id,
                    } 
                });
                setArticles(dataMod);
            } else {
                if (data.message === "The page number requested is larger than the number of pages available.") {
                    setErr("No more results available.");
                } else {
                    setErr(data.message);
                }
                setArticles([]);
            }
            setPage(page+1);
            setLoading(false);
        } catch (error){
            setLoading(false);
            if (error.message === "data.map is not a function") {
                setErr("Current page and results per page mismatch. Do not change results per page when not on the first page.");
            } else {
                setErr(error.message);
            }
            console.log(error);
        }

    }

    /**
     * Sends request to Wordpress REST API with search query to get the previous page of articles and format them.
     * @param {Object} e Event Object.
     */
    const handlePrevPage = async (e) => {
        try {
            e.preventDefault();

            setLoading(true);
            setErr(null);

            let currentPage = page;
            if (currentPage - 1 < 1) {
                currentPage = 1;
            } else {
                currentPage--;
            }

            let response = await fetch(`${URL}&search=${search}&page=${currentPage}&per_page=${perPage}`);
            let data = await response.json();
            let dataMod = await data.map((article) => {
                return {
                    date: formatDateStr(article.date),
                    title: formatTitleStr(article.title.rendered),
                    author: formatAuthorStr(article.content.rendered, article.title.rendered),
                    link: article.link,
                    id: article.id,
                } 
            });
            setPage(currentPage);
            setArticles(dataMod);
            setLoading(false);
        } catch (error){
            setLoading(false);
            if (error.message === "data.map is not a function") {
                setErr("Current page and results per page mismatch. Do not change results per page when not on the first page.");
            } else {
                setErr(error.message);
            }
            console.log(error);
        }
 
    }

    return (
        <main className='search-page'>
            <div className='search-container'>
                <form>
                    <div className="input-div">
                        <input 
                            name="search" 
                            type="search"
                            value={search}
                            onChange={handleSearchInput}
                            placeholder="Search titles, authors, and key words" />
                    </div>
                    <div className='options'>
                        <div className='per-page-radio'>
                            <label>Results Per Page:</label>
                            <div className='per-page-radio-options'>
                                <div>
                                    <input 
                                        name="perPage"
                                        type="radio" 
                                        id="perPage10"
                                        value="10" 
                                        checked={pp1Checked}
                                        onChange={handlePerPageInput1} />
                                    <label>10</label>
                                </div>
                                <div>
                                    <input 
                                        name="perPage"
                                        type="radio" 
                                        id="perPage40"
                                        value="40"
                                        checked={pp2Checked}
                                        onChange={handlePerPageInput2} />
                                    <label>40</label>
                                </div>
                                <div>
                                    <input 
                                        name="perPage"
                                        type="radio" 
                                        id="perPage100"
                                        value="100"
                                        checked={pp3Checked}
                                        onChange={handlePerPageInput3} />
                                    <label>100</label>
                                </div>
                            </div>
                        </div>
                        <div className='search-btns'>
                            <button 
                                type="submit" 
                                className='search-button button'
                                onClick={handleSearch}>
                                Search
                            </button>
                            <button
                                className='clear-button button'
                                onClick={handleClearSearch}>
                                Clear
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div className='article-container'>
            { loading ? (
                <Loading />
            ) : (
                <div className='article-container'>
                    { err ? (
                        <div className='error-container'>
                            <div className='no-articles'>
                                <h3>Something went wrong.</h3>
                                <p>Error: {err}</p>
                                <p>Please return to the previous page or select clear above.</p>
                            </div>
                            <form className='pagination-container'>
                                <button
                                    className='button'
                                    onClick={handlePrevPage}>
                                    Prev
                                </button>
                                <p className='current-page'>Page {page}</p>
                                <button
                                    className='disabled button'
                                    disabled>
                                    Next
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            { submitted ? (
                            <div className='results-container'>
                                { articles.length > 0 ? (
                                    articles.map((article) => {
                                        return (
                                            <Article 
                                            key={article.id}
                                            title={article.title}
                                            author={article.author}
                                            date={article.date}
                                            link={article.link} />
                                        )
                                    })
                                ) : (
                                    <NoArticles />
                                )}
                                { articles.length > 0 ? (
                                    <form className='pagination-container'>
                                        { page === 1 ? (
                                            <button
                                                className='disabled button'
                                                disabled>
                                                Prev
                                            </button>
                                        ) : (
                                            <button
                                                className='button'
                                                onClick={handlePrevPage}>
                                                Prev
                                            </button>
                                        )}
                                        <p className='current-page'>Page {page}</p>
                                        <button
                                            className='button'
                                            onClick={handleNextPage}>
                                            Next
                                        </button>
                                    </form>
                                ) : (
                                    <></>
                                )}
                            </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    )}
                </div>
            )}
            </div>
        </main>
    );
}

export default SearchPage;