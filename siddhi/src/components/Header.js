import React from "react";
import { Link } from "react-router-dom";
import $ from "jquery";
import { assetsImagesURL, cloudImageURL } from '../Misc/common_functions';
import _ from 'lodash';

class Header extends React.Component {
    constructor(props) {
        super(props);
        this.initialsData = {};
        if (props.state) {
            this.initialsData = props.state
        }
        this.state = {
            logoImage: assetsImagesURL + 'logo.svg'
        }
    }
    render() {
        const logoImage = this.props && this.props.data.logo ? cloudImageURL + _.values(this.props.data.logo)[0] : this.state.logoImage;
        return (<header className={"header"}>
            <div className={"container"}>
                <div className={"clearfix"}>
                    <div className={"row"}>
                        <div className={"col-md-3 col-6 logo-col-block"}>
                            <Link to={"/"} title={"Project"} className={"logo"}>
                                <img src={logoImage} alt={"Logo"} title={"Logo"} className={"header-logo-image"} />
                                <span>Project</span>
                            </Link>
                        </div>
                        <div className={"col-md-9 col-6 navigation-col-mobile"}>
                            <div className={"navigation-menu mobile-navigation"}>
                                <ul>
                                    {this.props.navigation && Object.keys(this.props.navigation).map((key) => {
                                        if (this.props.navigation[key] && this.props.navigation[key].visible) {
                                            var absolute = /^https?:\/\/|^#$/;  //for absolute URLs or only # use <a> otherwise <Link>
                                            var css = {};
                                            var className = "";
                                            var eleClass = "";
                                            var style = this.props.buttonStyles[this.props.navigation[key].style];
                                            var href = this.props.navigation[key].destination;
                                            if (style.showBackground) {
                                                css["backgroundColor"] = style.backgroundColor;
                                                className = "primary-button";
                                                eleClass = "join-button";
                                            }
                                            css["color"] = style.textColor;
                                            return (<li className={eleClass} key={this.props.navigation[key].id}>
                                                {
                                                    absolute.test(href)
                                                        ?
                                                        <a href={href}
                                                            className={className}
                                                            title={this.props.navigation[key].title}
                                                            style={css}>
                                                            {this.props.navigation[key].title}
                                                        </a>
                                                        : <Link className={className}
                                                            to={href}
                                                            title={this.props.navigation[key].title}
                                                            style={css}>
                                                            {this.props.navigation[key].title}
                                                        </Link>
                                                }

                                            </li>);
                                        }
                                    })}
                                </ul>
                            </div>
                            <div className={"hambourger-menu"}>
                                <a href={"#"} className={"hambourger"}>
                                    <span></span>
                                    <span className={"middle-child"}></span>
                                    <span></span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>);
    }
}

export default Header;
