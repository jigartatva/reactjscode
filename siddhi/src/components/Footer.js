import React from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import Remarkable from 'remarkable';
import RemarkableReactRenderer from 'remarkable-react';
import { assetsImagesURL } from '../Misc/common_functions';

const Footer = (props) => {
    const md = new Remarkable({ breaks: true, html: true });
    md.renderer = new RemarkableReactRenderer();
    return (<footer className={"footer"}>
        <div className={"container"}>
            <div className={"row"}>
                <div className={"col-md-7"}>
                    <div className={"footer-news"}>
                        {props.footer.newsItems && (
                            <div>
                                <h3>{props.footer.newslabel || ''}</h3>
                                <ul>
                                    {props.footer.newsItems && props.footer.newsItems.map((newsItem) => {
                                        if (props.newsItems[newsItem] && props.newsItems[newsItem].publish) {
                                            var date = moment(props.newsItems[newsItem].date).format("YYYY-MM-DD");
                                            var title = props.newsItems[newsItem].title;
                                            var text = props.newsItems[newsItem].text;
                                            if (props.newsItems[newsItem] && props.newsItems[newsItem].publish) {
                                                return (<li key={props.newsItems[newsItem].id} className={"clearFix"} title={title}>
                                                    <date>{date}</date>
                                                    <Link to={"/news/" + newsItem}>{title}</Link>
                                                </li>);
                                            } else {
                                                return null;
                                            }

                                        }
                                    })}
                                </ul>
                            </div>)
                        }
                        {
                            props.footer.footeraddress
                                ? md.render(props.footer.footeraddress)
                                : null
                        }
                    </div>
                </div>
                <div className={"col-md-5"}>
                    <ul className={"social-list-block"}>
                        {
                            props.footer.email.emailAddress && <li className={"mail-icon"}>
                                <a href={"mailto:" + props.footer.email.emailAddress} title={props.footer.email.title}>
                                    <i><em><img src={assetsImagesURL + "mail-icon.svg"} alt={"Email"} title={"Email"} id={"footer-email-img"} style={{ height: 15 }} /></em></i>
                                    <span>{props.footer.email.emailAddress}</span>
                                </a>
                            </li>
                        }
                        {
                            props.footer.twitter.url && <li className={"twitter-icon"}>
                                <a href={props.footer.twitter.url} title={props.footer.twitter.title}>
                                    <i><em><img src={assetsImagesURL + "twitter-icon.svg"} alt={"Twitter"} title={"Twitter"} id={"footer-twitter-img"} style={{ height: 18 }} /></em></i>
                                    <span>{props.footer.twitter.title}</span>
                                </a>
                            </li>
                        }
                        {
                            props.footer.facebook.url && <li className={"facebook-icon"}>
                                <a href={props.footer.facebook.url} title={props.footer.facebook.title}>
                                    <i><em><img src={assetsImagesURL + "facebook-icon.svg"} alt={"Facebook"} title={"Facebook"} id={"footer-facebook-img"} style={{ height: 22 }} /></em> </i>
                                    <span>{props.footer.facebook.title}</span>
                                </a>
                            </li>
                        }
                        {
                            props.footer.slack.url && <li className={"slack-icon"}>
                                <a href={props.footer.slack.url} title={props.footer.slack.title}>
                                    <i><em><img src={assetsImagesURL + "slack-icon.svg"} alt={"Slack"} title={"Slack"} id={"footer-slack-img"} style={{ height: 22, width: 30 }} /></em> </i>
                                    <span>{props.footer.slack.title}</span>
                                </a>
                            </li>
                        }
                    </ul>
                </div>
            </div>
        </div>
        <div className={"copyright-text"}>
            <div className={"container"}>
                <div className={"row"}>
                    <div className={"col-md-12"}>
                        <div className={"privacy-terms-links"}>
                            {
                                props.footer.privacyandteams
                                    ? md.render(props.footer.privacyandteams)
                                    : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer>)
};
export default Footer;
