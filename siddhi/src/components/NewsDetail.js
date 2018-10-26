import React from "react";
import NewsInDetailSection from "./sections/NewsInDetailSection";
import { Helmet } from 'react-helmet';
import { cloudImageURL } from '../Misc/common_functions';
class NewsDetail extends React.Component {
    constructor(props) {
        super(props);
        this.initialsData = {};
        if (props.state) {
            this.initialsData = props.state
        }
    }
    render() {
        if (this.props.match.params && isNaN(this.props.match.params.id)) {
            return <div />;
        }
        const aboutBackgroundImage = this.initialsData.aboutPage.background ? cloudImageURL + _.values(this.initialsData.aboutPage.background)[0] : '';
        const bgCss = aboutBackgroundImage ? { background: `url(${aboutBackgroundImage}) no-repeat`, backgroundSize: 'cover' } : {};

        return (
            <main className={"news-detail"} style={bgCss}>

                <NewsInDetailSection
                    news={this.initialsData.newsItems[this.props.match.params.id]}
                    pageData={this.initialsData.newsListPage || {}} />
            </main>
        );
    }
}

export default NewsDetail;
