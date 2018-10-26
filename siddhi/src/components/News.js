import React from "react";
// import initialsData from "../api.js";
import { cloudImageURL } from '../Misc/common_functions';
import NewsListings from "./sections/NewsListings";
import { Helmet } from 'react-helmet';
//import $ from "jquery";

class News extends React.Component {
    constructor(props) {
        super(props);
        this.initialsData = {};
        if (props.state) {
            this.initialsData = props.state
        }
    }
    render() {
        const aboutBackgroundImage = this.initialsData.aboutPage.background ? cloudImageURL + _.values(this.initialsData.aboutPage.background)[0] : '';
        const bgCss = aboutBackgroundImage ? { background: `url(${aboutBackgroundImage}) no-repeat`, backgroundSize: 'cover' } : {};

        return (
            <main className={"news-listings"} style={bgCss}>
                <NewsListings
                    newsItems={this.initialsData.newsItems}
                    pageData={this.initialsData.newsListPage || {}}
                />
            </main>
        );
    }
}

export default News;
