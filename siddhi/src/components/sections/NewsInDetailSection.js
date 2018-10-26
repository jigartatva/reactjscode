import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Remarkable from 'remarkable';
import RemarkableReactRenderer from 'remarkable-react';
import { cloudImageURL, toMarkup } from "../../Misc/common_functions.js";

const NewsInDetailSection = (props) => {
    const imgStyle = {
        'height': 'auto',
        'width': '100%'
    };
    const md = new Remarkable({ breaks: true, html: true });
    md.renderer = new RemarkableReactRenderer();
    const headerImage = props.news.headerImage ? cloudImageURL + _.values(props.news.headerImage)[0] : "";
    return (
        <section>
            <div className={"container"}>
                <div className={"news-box"}>
                    {headerImage && <img style={imgStyle} src={headerImage}></img>}
                    <div dangerouslySetInnerHTML={{ __html: toMarkup(props.news && props.news.title) }}
                        className={"news-box-title"}>
                    </div>
                    {(props.news)
                        ? <date>
                            {moment(props.news.date).format("YYYY-MM-DD")}
                        </date>
                        : null
                    }
                    <div className={"news-box-text"}>
                        {
                            props.news.text
                                ? md.render(props.news.text)
                                : null
                        }
                        <Link to={"/" + props.pageData.urlslug || "news-listings"} className={"primary-button view-all-news"}>VIEW ALL NEWS</Link>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default NewsInDetailSection;