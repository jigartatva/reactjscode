import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { toMarkup, getSortedNewsListings } from "../../Misc/common_functions.js";

const NewsListings = (props) => (
    <section>
        <div className={"container"}>
            <div className={"news-listings-box"}>
                <div className={"news-listings-title"}>News &amp; Updates</div>
                <ul className={"news-and-update-items"}>
                    {props.newsItems && getSortedNewsListings(props.newsItems).map((newsItem) => {
                        if (newsItem && newsItem.publish) {
                            var date = moment(newsItem.date).format("YYYY-MM-DD");
                            var title = newsItem.title;
                            return (<li key={newsItem.id} className={"clearFix"} title={title}>
                                <date>{date}</date>
                                <Link to={"/news/" + newsItem.id}><span dangerouslySetInnerHTML={{ __html: toMarkup(title) }}></span></Link>
                            </li>);
                        } else {
                            return null;
                        }
                    })}
                </ul>
            </div>
        </div>
    </section>
);

export default NewsListings;