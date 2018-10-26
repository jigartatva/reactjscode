import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { actionSuccess, actionFail } from '../helpers/action';
import { signOut, signInStatus, getCurrentUser } from '../actions/login';
import { ACTION_SIGN_IN, ACTION_STATUS_REQUEST, ACTION_STATUS_SUCCESS, ACTION_STATUS_FAIL, ACTION_SIGN_IN_STATUS, ACTION_USER_PROFILE } from '../constants';
import styles from './root-container.scss';
// Miui theme configuration
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { grey400, darkBlack, lightBlack, lightGreen700 } from 'material-ui/styles/colors';
import config from '../config';

const muiTheme = getMuiTheme({
    palette: {
        textColor: "#000000",
        primary1Color: lightBlack,
        primary2Color: "#6F9C3D",
        accent1Color: lightGreen700,
        pickerHeaderColor: lightGreen700
    }
});
const RootContainer = React.createClass({

    componentDidMount() {
    },

    componentWillReceiveProps(nextProps, prevProps) {

       const sharelink = _.split(nextProps.location.pathname, '/');
        if (nextProps.location.pathname !== '/login' && nextProps.location.pathname !== '/signup') {
            if (actionFail(ACTION_SIGN_IN_STATUS, nextProps.login.type, nextProps.login.actionStatus)) {
                if (sharelink[1] !== "share" && sharelink[1] !== "signup" && sharelink[1] !== "emailVerify" && sharelink[1] !== "forgotpassword") {
                    this.props.navigateToLoginScreen();
                }
            } else if (actionSuccess(ACTION_SIGN_IN, nextProps.login.type, nextProps.login.actionStatus)) {
                window.Intercom('boot', {
                    app_id: config.intercomKey,
                    name: nextProps.login.user.displayName || nextProps.login.user.email, // Full name
                    email: nextProps.login.user.email, // Email address
                    created_at: Date.now() // Signup date as a Unix timestamp
                });
            } else if (!this.props.login.user && nextProps.login.user) {
                window.Intercom('boot', {
                    app_id: config.intercomKey,
                    name: nextProps.login.user.displayName || nextProps.login.user.email, // Full name
                    email: nextProps.login.user.email, // Email address
                    created_at: Date.now() // Signup date as a Unix timestamp
                });
            } else if (nextProps.login.user) {
                window.Intercom('update', {
                    app_id: config.intercomKey,
                    name: nextProps.login.user.displayName || nextProps.login.user.email, // Full name
                    email: nextProps.login.user.email, // Email address
                    created_at: Date.now() // Signup date as a Unix timestamp
                });
            } else if (actionSuccess(ACTION_USER_PROFILE, nextProps.login.type, nextProps.login.actionStatus)) {
                window.Intercom('boot', {
                    app_id: config.intercomKey,
                    name: nextProps.login.displayName || nextProps.login.email, // Full name
                    email: nextProps.login.email, // Email address
                    created_at: Date.now() // Signup date as a Unix timestamp
                });
            }
        }
    },

    render() {
        return (
            <MuiThemeProvider muiTheme={muiTheme}>
                <main className={styles['root-container']}>
                    {this.props.children}
                </main>
            </MuiThemeProvider>
        );
    }

});

function mapStateToProps(state) {
    return {
        login: state.login || {}
    }
}

function mapDispatchToProps(dispatch) {
    return {
        signOut: () => {
            dispatch(signOut());
        },
        signInStatus: () => {
            dispatch(signInStatus());
        },
        navigateToLoginScreen: () => {
            dispatch(push('/login'));
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer);
