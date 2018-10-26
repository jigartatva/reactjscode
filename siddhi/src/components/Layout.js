import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import News from "./News";
import NewsDetail from "./NewsDetail";
import NotFound from "./NotFound";
import { Switch, Route } from 'react-router';
import { Helmet } from 'react-helmet';

class Layout extends React.Component {

    constructor(props) {
        super(props);
        var data = typeof props.state == 'string' ? JSON.parse(props.state) : props.state;
        if (data) {
            this.initialsData = data;
        } else {
            this.initialsData = {
                newsItems: {},
            }
        }
    }
    componentDidUpdate() {
        if (window.location.href.split('#').length === 1) {
            var currentScrollTop = document.body.scrollTop || document.documentElement.scrollTop;
            var intervalId = setInterval(toTop, 1);
            function toTop() {
                if (parseInt(window.pageYOffset) <= 0) {
                    document.body.scrollTop = 0;   //for safari
                    document.documentElement.scrollTop = 0; //for Chrome, Firefox, IE and Opera
                    clearInterval(intervalId);
                }
                else {
                    document.body.scrollTop -= (currentScrollTop / 200);   //for safari
                    document.documentElement.scrollTop -= (currentScrollTop / 200); //for Chrome, Firefox, IE and Opera
                }
            }
        }
        else { //for URLs like #pricing this block is used
            var hash = location.hash.substring(1);
            var element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }
    render() {
        if (!this.initialsData.navigation) {
            return (<div>Loading.....</div>);
        }
        let dataForNews = {};

        dataForNews["newsItems"] = this.initialsData.newsItems ? this.initialsData.newsItems : {};
        dataForNews["aboutPage"] = this.initialsData.aboutPage ? this.initialsData.aboutPage : {};
        dataForNews["newsListPage"] = this.initialsData.newsList ? this.initialsData.newsList : {};

        return (
            <div className={"wrapper"}>
                <Helmet>
                    <title>Project</title>
                    <meta name="description" content="Project Description" />
                </Helmet>
                <Header navigation={this.initialsData.navigation ? this.initialsData.navigation : []}
                    buttonStyles={this.initialsData.buttonStyles}
                    mobileMenu={this.initialsData.mobileMenu}
                    data={this.initialsData.hero}
                />
                <Switch>
                    <Route key={"/news/:id"}
                        path={"/news/:id"}
                        render={(props) => (
                            <NewsDetail {...props} state={dataForNews} />
                        )} />
                    <Route key={"/" + (this.initialsData.newsList.urlslug || 'news-listings')}
                        path={"/" + (this.initialsData.newsList.urlslug || 'news-listings')}
                        render={(props) => (
                            <News {...props} state={dataForNews} />
                        )} />
                    <Route key={"/*"}
                        path={"/*"}
                        render={(props) => (
                            <NotFound />
                        )} />
                </Switch>
                <Footer footer={this.initialsData.footer && this.initialsData.footer}
                    newsItems={this.initialsData.newsItems && this.initialsData.newsItems}
                />
            </div>
        );
    }
}

export default Layout;
