import React from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { actionSuccess, actionFail } from '../helpers/action';
import { ACTION_SIGN_IN_STATUS, ACTION_USER_PROFILE } from '../constants';
import { getCurrentUser } from '../actions/login';

var IndexContainer = React.createClass({

    componentWillReceiveProps(nextProps, prevProps) {
        if (actionSuccess(ACTION_SIGN_IN_STATUS, nextProps.login.type, nextProps.login.actionStatus)) {
            if (nextProps.login.user) {
                this.props.statusLoggedIn();
            }
        }
        if (actionSuccess(ACTION_USER_PROFILE, nextProps.login.type, nextProps.login.actionStatus)) {
            this.props.statusLoggedIn();
        }
        if (actionFail(ACTION_USER_PROFILE, nextProps.login.type, nextProps.login.actionStatus)) {
            this.props.statusNotLoggedIn();
        }
    },

    componentDidMount() {
        this.props.getCurrentUser();
    },

    render() {
        return null;
    }
});

function mapStateToProps(state) {
    return {
        login: state.login || {}
    }
}

function mapDispatchToProps(dispatch) {
    return {
        statusLoggedIn: () => {
            dispatch(push('/models'));
        },
        statusNotLoggedIn: () => {
            dispatch(push('/login'));
        },
        getCurrentUser: () => {
            dispatch(getCurrentUser());
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(IndexContainer);
