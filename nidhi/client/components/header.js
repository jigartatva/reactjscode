import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Link } from 'react-router'
import classNames from 'classnames';
import _ from 'lodash';
import { modelsNew, modelsList } from '../actions/models';
import { updateProfile, getCurrentUser, updateUserPassword, updateUserPicture } from '../actions/login';
import { trackEvent } from '../helpers/mixpanel';
import { setSearchKeyword } from '../actions/actions';
/* Material UI */
import { AppBar as MaterialAppBar } from 'material-ui';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import IconButton from 'material-ui/IconButton';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton'
import Divider from 'material-ui/Divider';
import Avatar from 'material-ui/Avatar';
/* react toolbox */
import { Button } from 'react-toolbox/lib/button';
import { AppBar, Checkbox, FontIcon } from 'react-toolbox';
import { Layout, NavDrawer, Panel, Sidebar, Snackbar } from 'react-toolbox';
import Navigation from 'react-toolbox/lib/navigation';
import { Menu, MenuDivider } from 'react-toolbox/lib/menu';
import Dialog from 'react-toolbox/lib/dialog';
import Input from 'react-toolbox/lib/input';
import ShowTutorialDialog from './models/ShowTutorialDialog';
/* components */
import LoveSpreads from './LoveSpreads';
import ShowWelcomeDialog from './ShowWelcomeDialog';
import ShowPlanModelDialog from './ShowPlanModelDialog';
import { getCheckBox, getModelTipsCheckBox } from '../actions/models';
import { clearRecentIcon } from '../actions/iconPicker';


import styles from './header.scss';

const Header = React.createClass({

    getInitialState() {
        return {
            addNewModelMenuOpen: false,
            active: false,
            email: '',
            displayName: '',
            photoURL: '',
            newPassword: '',
            confirmPassword: '',
            errorMsg: '', // display local error message
            messagetype: 0,
            searchKeyword: '',
            showSnackBar: false,
            showTutorialDialog: false,
            currentVideo: 1,
            accountDropdownOpen: false,
            isSelected: false,
            openPlanModel: false,
        };
    },

    componentDidMount() {
        this.props.getCurrentUser();
        document.addEventListener('mousedown', this.handleOutsideClick);
        this.setState({ searchKeyword: this.props.searchKeyword });
        this.props.getCheckBox();
        this.props.getModelTipsCheckBox();
        if (this.props.login.checkValue == true && this.props.login.type == 'ACTION_SIGN_IN') {
            _.delay(() => {
                this.setState({ addNewModelMenuOpen: !this.state.addNewModelMenuOpen });
            }, 3000)
        }
    },

    componentWillReceiveProps(nextProps) {
        const { type, actionStatus, displayName, email, message, photoURL, emailVerified } = nextProps.login;
    
        if (type == "ACTION_UPDATE_PROFILE" && actionStatus == "ACTION_STATUS_SUCCESS") {
            if (this.state.active) {
                this.setState({
                    showSnackBar: true,
                });
            }
            else {
                this.setState({
                    showSnackBar: false,
                });
            }
            this.setState({
                active: false,
                email: email || "",
                displayName: displayName || "",
                photoURL: photoURL || "",
                errorMsg: message,
                messagetype: 1,
                isSelected: false
            });
            _.delay(() => {
                this.setState({
                    errorMsg: ""
                })
            }, 4000);
        } else if (actionStatus == "ACTION_STATUS_FAIL" && type == "ACTION_UPDATE_PROFILE") {
            this.setState({ errorMsg: message, messagetype: 0 });
        }
        if (actionStatus == "ACTION_STATUS_SUCCESS" && type == "ACTION_USER_PROFILE") {
            if (emailVerified == false) {
                this.props.navigateToLogin();
            }
            this.setState({
                email: email || "",
                displayName: displayName || "",
                photoURL: photoURL || "",
                errorMsg: message,
                messagetype: 1
            });

        } else if (actionStatus == "ACTION_STATUS_FAIL" && type == "ACTION_USER_PROFILE") {
            this.props.logout();
        }
    },

    handleToggle() {
        this.setState({
            newPassword: '',
            confirmPassword: '',
            errorMsg: "",
            active: false,
            showTutorialDialog: false,
            addNewModelMenuOpen: false,
            openPlanModel: false,
        });
        window.location.hash = '';
    },
    handleChange(value, ev) {
        if (this.state.errorMsg !== "") { this.setState({ errorMsg: "" }) }
        this.setState({ [ev.target.name]: value });
    },

    openWelcome() {
        this.setState({
            showTutorialDialog: false,
            addNewModelMenuOpen: true
        });
    },

    validateForm() {
        var errorMessage = '';
        if (!_.isEmpty(this.state.newPassword)) {
            if (_.isEmpty(this.state.confirmPassword)) {
                errorMessage += 'Please enter confirm password. \n';
            }
            if (!_.eq(this.state.newPassword, this.state.confirmPassword)) {
                errorMessage += 'New password and confirm password do not match. \n';
            }
            if (this.state.newPassword.length < 8) {
                errorMessage += 'Password should be at least 8 characters.\n';
            }
        }

        if (!_.isEmpty(errorMessage)) {
            this.setState({ errorMsg: errorMessage, messagetype: 0 });
            return false;
        }
        return true;
    },

    handleUpdate() {
        if (this.validateForm()) {
            this.props.updateProfile(this.state.email, this.state.displayName, this.state.newPassword);
        }
    },

    handleKeyPress(e) {
        const key = e.key.toLowerCase();
        switch (key) {
            case 'enter':
                this.props.setSearchKeyword(this.state.searchKeyword);
                break;
            default:
                this.props.setSearchKeyword(this.state.searchKeyword);
                break;
        }
    },

    handleRequestToCloseSnackbar() {
        this.setState({ showSnackBar: false });
        _.delay(() => {
            this.setState({ errorMsg: '' });
        }, 1500);
    },
    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        if (key == 'enter') {
            this.handleUpdate();
        }
    },
    handleClick() {
        if(this.state.accountDropdownOpen){
            document.removeEventListener('click', this.handleOutsideClick,false);
            trackEvent('Closing the Account Dropdown menu');
            // if(!this.state.isSelected){
                this.setState({accountDropdownOpen:false});
            // }
        } else {
            document.addEventListener('click', this.handleOutsideClick,false);
        }
        
    }, 
    handleOutsideClick(e) {
    // ignore clicks on the component itself
    if (this.node && this.node.contains(e.target)) {
        return;
    }
    
    this.handleClick();
  },
    uploaddDisplayPicture(event) {
        event.stopPropagation();
        if (event.target.files.length) {
            var fileToUpload = event.target.files[0];
            this.props.updateUserPicture(fileToUpload);
        } else {
            this.setState({isSelected:false});
            return;
        }
    },


    componentWillUnmount() {
        document.removeEventListener('mousedown', this.handleOutsideClick);
    },
    render() {
        const { login } = this.props;
        const { photoURL } = this.state;
        const actions = [
            {
                label: "Cancel",
                onClick: this.handleToggle,
                style: { position: 'absolute', bottom: '16px', left: '15px', minWidth: '9rem', color: 'black' },
            },
            {
                label: "Save",
                onClick: this.handleUpdate,
                style: { position: 'absolute', bottom: '16px', right: '15px', minWidth: '9rem', color: 'white', backgroundColor: '#D04820' },
            },
            {
                style: { position: 'absolute', top: 0, right: 0, },
                icon: "close",
                onClick: () => this.handleToggle(),
                neutral: false
            }
        ];
        const headerTitle = <Button icon='add'
                                    style={(this.props.loading == true || this.props.open == true) ?  { display: 'none' } : { display: 'block', margin: '14px 0' }}
                                    onClick={() => {
                                        return ((this.props.totalmodel >= this.props.planMetaData.free_models) && (this.props.planMetaData.free_models != -1))
                                            ?
                                            this.setState({ openPlanModel: !this.state.openPlanModel })
                                            :
                                            this.setState({ addNewModelMenuOpen: !this.state.addNewModelMenuOpen })
                                        }
                                    }
                                    raised accent label="New Model"
                                    disabled={(this.props.loading == true || this.props.open == true) ? true : false}/>;
        var divStyle = {
            backgroundSize: 'cover',
            backgroundImage: 'url(' + photoURL + ')'
        }
        return (
            <div className={styles.header}>
                <div className={styles.logoBar}>
                    <span className={styles.logo} >
                        <img src="./public/Logo_White.png" />
                    </span>
                    <div className={styles.searchBar}>
                        <div className={styles.inputFieldContainer}>
                            <input
                                type="text"
                                ref="searchbox"
                                className={styles.inputField}
                                value={this.state.searchKeyword}
                                placeholder="Search Model"
                                onKeyDown={this.handleKeyPress}
                                onChange={(e) => { this.setState({ searchKeyword: e.target.value }); this.props.setSearchKeyword(e.target.value); }}
                                data-hj-whitelist
                            />
                            <FlatButton
                                className={styles.searchButton}
                                icon={<FontIcon className={'material-icons'} >search</FontIcon>}
                            />
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        {this.state.accountDropdownOpen
                            ?
                            <span className={(!_.isEmpty(this.state.photoURL)) ? styles.topArrow : styles.topArrowWithNoPhoto} ></span>
                            :
                            ''
                        }
                        <IconMenu
                            className={styles.iconMenu}
                            iconStyle={{ fontSize: '3.6rem', color: '#888888' }}
                            onClick={() => { trackEvent('Opening Notifications Dropdown'); }}
                            iconButtonElement={<IconButton><FontIcon className="material-icons" >notifications</FontIcon></IconButton>}
                        >
                            <MenuItem value="none" primaryText="No notifications at this time." disabled={true} />
                        </IconMenu>
                        <LoveSpreads />
                        <div ref={node => { this.node = node; }} style={{ display: 'inline-block' }}>
                            <a
                                className={styles.iconMenu}
                                onClick={() => { this.handleClick(); }}
                            >
                                {!_.isEmpty(this.state.photoURL)
                                    ?
                                    <IconButton
                                        style={{ padding: '5px' }}
                                        onClick={() => { trackEvent('Opening Account Dropdown'); this.setState({ accountDropdownOpen: true }); }}
                                    >
                                        <div className={styles.inlineBlock}>
                                            <div className={styles.accountDropDown + ' ' + styles.accountDropDownIcon} style={divStyle}></div>
                                        </div>
                                        <FontIcon className="material-icons" className={styles.accountDropDown}>arrow_drop_down</FontIcon>
                                    </IconButton>
                                    :
                                    <IconButton style={{ padding: '5px' }} onClick={() => { trackEvent('Opening Account Dropdown'); this.setState({ accountDropdownOpen: true }); }} className={styles.accountDropDown} >
                                        <FontIcon className={styles.accountCircleClass + " material-icons"} style={{ fontSize: '3.6rem !important', color: 'rgb(136, 136, 136)' }} >account_circle</FontIcon>
                                        <FontIcon className={styles.downArrowClass + " material-icons"} >arrow_drop_down</FontIcon>
                                    </IconButton>
                                }
                            </a>
                            {this.state.accountDropdownOpen
                                ?
                                <Menu className={(!_.isEmpty(this.state.photoURL)) ? styles.accountMenuClass : styles.accountMenuClassWithNoPhoto} ref={(ref) => this.accountDropDownRef1 = ref} >
                                    <MenuItem
                                        disabled={true}
                                        ref={(ref) => this.accountDropDownRef2 = ref}
                                        style={{ borderBottom: '1px solid black' }}
                                        className={styles.accountMenu}
                                        children={
                                            <div ref="accountDropDownRef3" className={styles.accountDropDown}>

                                                {!_.isEmpty(this.state.photoURL)
                                                    ?
                                                    <div style={{ display: 'inline-block', height: '80px', width: '80px', overflow: 'hidden', borderRadius: '50%' }} className={styles.changePictureButton} >
                                                        <div className={styles.changeButtonOuter} style={divStyle} >
                                                            <a className={styles.avatarChangeButton} onClick={(e) => { this.uploadDisplayPicture.click(); this.setState({ isSelected: true }) }} >change</a>
                                                        </div>
                                                    </div>
                                                    :
                                                    <div style={{ display: 'inline-block', height: '85px', width: '85px', overflow: 'hidden' }} className={styles.changePictureButton} >
                                                        <FontIcon className="material-icons"
                                                        style={{ backgroundColor: 'transparent', fontSize: '93px', display: 'flex', marginLeft: '-5px', color: 'rgb(136, 136, 136)', cursor: 'pointer !important' }} >account_circle</FontIcon>
                                                        <div className={styles.changeButtonOuterWhenNoIcon}  >
                                                            <a className={styles.avatarChangeButton} onClick={(e) => { this.uploadDisplayPicture.click(); this.setState({ isSelected: true }) }} >change</a>
                                                        </div>
                                                    </div>

                                                }
                                                <input type="file" style={{ display: 'none' }} name="user_photo" accept="image/*" onChange={(event) => { this.uploaddDisplayPicture(event); }} ref={(ref) => this.uploadDisplayPicture = ref} />
                                                <div className={styles.menuDetailOuter}>
                                                    <span ref="accountDropDownRef4" className={styles.menuDisplayName} >{this.state.displayName}</span>
                                                    <span className={styles.menuEmail} >{this.state.email}</span>
                                                    <Button raised className={styles.letsGoButton} style={{ height: '30px', position: 'absolute', bottom: '0px' }} primary label="My Account" onClick={() => { trackEvent('Opening Account Settings'); this.setState({ active: !this.state.active, accountDropdownOpen: false }) }} />
                                                </div>
                                            </div>
                                        }
                                    />
                                    <MenuItem value='watchTutorials'
                                        leftIcon={<FontIcon value="video_library" style={{ margin: '-5px 12px 0' }} />}
                                        children={
                                            <span>Watch Tutorials</span>
                                        }
                                        className={styles.menuItemCommon}
                                        style={{ borderBottom: '1px solid black', backgroundColor: '#FFF' }}
                                        onClick={() => { trackEvent('Opening Tutorials Dialog'); this.setState({ currentVideo: document.location.hash || 1, showTutorialDialog: true, accountDropdownOpen: false }); }}
                                    />
                                    <MenuItem
                                        value='Feedback'
                                        leftIcon={<img src="../../public/feedback-menu.svg"
                                            style={{ width: '22px', height: '22px', position: 'absolute', margin: '-5px 12px 0' }} />}
                                        children={
                                            <span>Feedback</span>
                                        }
                                        className={styles.menuItemCommon} style={{ borderBottom: '1px solid black', backgroundColor: '#FFF' }}
                                        onClick={() => { window.open('https://feedback.userreport.com/d1d2cf38-6d2a-47dc-944a-ff4e9df529f4 '); this.setState({ accountDropdownOpen: false }); }}
                                    />
                                    <MenuItem
                                        value='ChatWithUs'
                                        leftIcon={<img src="../../public/chat-menu.svg"
                                            style={{ width: '22px', height: '22px', position: 'absolute', margin: '-5px 12px 0' }} />}
                                        className={styles.menuItemCommon} style={{ borderBottom: '1px solid black', backgroundColor: '#FFF' }}
                                        children={
                                            <span>Chat With Us</span>
                                        }
                                        ref={(ref) => this.nodese = ref}
                                        onClick={() => { Intercom('show'); this.setState({ accountDropdownOpen: false }); }}
                                    />
                                    <MenuItem
                                        value='signout'
                                        style={{ backgroundColor: '#F2F2F2', textAlign: 'center' }}
                                        className={styles.signOutOuter}
                                        children={
                                            <Button raised
                                                className={styles.letsGoButton + ' ' + styles.signoutButton}
                                                label="Sign out"
                                                onClick={() => { trackEvent('Logging Out via Account Dropdown'); this.props.logout(); this.setState({ accountDropdownOpen: false }); }}
                                            />
                                        }
                                    />
                                </Menu>
                                :
                                ''
                            }
                        </div>
                    </div>
                </div>
                <MaterialAppBar
                    title=''
                    titleStyle={{ width: 'auto', flex: 0 }}
                    style={{ backgroundColor: '#6F9C3D', zIndex: 280 }} className={styles.appHeader} showMenuIconButton={false}>
                    {headerTitle}
                </MaterialAppBar>
                <Dialog
                    actions={actions}
                    active={this.state.active}
                    onEscKeyDown={this.handleToggle}
                    onOverlayClick={this.handleToggle}
                    title='Account Settings'
                >
                    <br />
                    <span style={{ color: (this.state.messagetype == 0 ? 'red' : 'green') }} >
                        {this.state.errorMsg ? this.state.errorMsg : ""}
                    </span>
                    <div className={styles.inputField}>
                        <div style={{ marginBottom: '20px' }} onKeyDown={this.handleKeyDown}>
                            <Input type='text' label='Email' name='email' value={this.state.email} onChange={this.handleChange} />
                            <Input type='text' label='Full Name' name='displayName' value={this.state.displayName} onChange={this.handleChange} />
                            <Input type='password' label='New Password' name='newPassword' value={this.state.newPassword} onChange={this.handleChange} />
                            <Input type='password' label='Confirm Password' name='confirmPassword' value={this.state.confirmPassword} onChange={this.handleChange} />
                        </div>

                    </div>
                </Dialog>
                <ShowPlanModelDialog active={this.state.openPlanModel} handleToggle={this.handleToggle} />
                <ShowTutorialDialog currentVideo={this.state.currentVideo} active={this.state.showTutorialDialog} handleToggle={this.handleToggle} />
                <ShowWelcomeDialog active={this.state.addNewModelMenuOpen} handleToggle={this.handleToggle} openWelcome={this.openWelcome} />
                <Snackbar
                    active={this.state.showSnackBar}
                    label={this.state.errorMsg}
                    timeout={3000}
                    onClick={this.handleRequestToCloseSnackbar}
                    onTimeout={this.handleRequestToCloseSnackbar}
                    type='accept'
                />
            </div >
        );
    }

});

function mapStateToProps(state) {
    return {
        login: state.login || {},
        models: state.models || {},
        searchKeyword: _.get(state, 'graphUi.searchKeyword', null) || '',
        modelCheckValue: _.get(state, 'graphUi.modelCheckValue'),
    }
}

function mapDispatchToProps(dispatch) {
    return {
        modelsNew: () => {
            dispatch(modelsNew());
        },
        logout: () => {
            dispatch(setSearchKeyword(''));
            dispatch(clearRecentIcon());
            dispatch(push('/login'));
        },
        updateProfile: (email, displayName, password) => { dispatch(updateProfile(email, displayName, password)) },
        getCurrentUser: () => { dispatch(getCurrentUser()) },
        setSearchKeyword: (searchKeyword) => { dispatch(setSearchKeyword(searchKeyword)) },
        getCheckBox: () => {
            dispatch(getCheckBox());
        },
        getModelTipsCheckBox: () => {
            dispatch(getModelTipsCheckBox());
        },
        clearRecentIcon: () => {
            dispatch(clearRecentIcon());
        },
        updateUserPicture: (file) => dispatch(updateUserPicture(file)),
        navigateToLogin: () => {
            dispatch(push('/login'));
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Header);
