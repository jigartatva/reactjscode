import md5 from 'blueimp-md5';
import _ from 'lodash';
import { USER_ROLE_NORMAL } from '../constants/common';
import { trackUser, trackEvent } from '../helpers/mixpanel';
import { setUploadProcess } from '../helpers/model';
import {
    ACTION_ELEMENTS_LOAD,
    ACTION_META_ATTRIBUTES_LOAD, ACTION_METADATA_LOAD, ACTION_MODELS_DATA_LOAD,
    ACTION_MODELS_LOAD,
    ACTION_MODELS_REFRESH, ACTION_POSITIONS_LOAD, ACTION_RELATIONSHIPS_LOAD,
    ACTION_STATUS_FAIL,
    ACTION_STATUS_REQUEST,
    ACTION_STATUS_SUCCESS
} from "../constants";
import { signInStatus, signOut } from "../actions/login";
import { push } from "react-router-redux";
import { connect } from "react-redux";
import { RootContainer } from "../containers/RootContainer";
let isLoaded = false;
let interval;
let promise;
let firebase;
let fileUploadArray = [];
let fireStore;

export function firebaseServiceInit(config, store) {
    fireStore = store;
    clearInterval(interval);
    promise = new Promise((resolve, reject) => {
        if (window.firebase) {
            firebase = window.firebase;
            configure(config, resolve);
        }
        else {
            loadExternal();
            interval = setInterval(() => {
                if (window.firebase) {
                    firebase = window.firebase;
                    configure(config, resolve);
                    clearInterval(interval);
                }
            }, 100);
        }
    });
}

export function firebasePromise() {
    return promise;
}

export function modelsAll() {
    return firebasePromise().then((app) => {
        const uid = app.auth().currentUser.uid;

        return new Promise((resolve, reject) => {
            app.database().ref().child('/user/' + uid + '/model').once('value').then(function (modelIds) {
                const modelPromises = _.map(modelIds.val(), (value, modelId) => {
                    return modelsLoad(modelId);
                });

                Promise.all(modelPromises).then((models) => {
                    resolve(_.orderBy(_.filter(models), ['modified'], ['desc']));
                });
            },
                (error) => {
                    resolve(null);
                });
        });
    });
}

export async function modelsLoad(modelId) {
    return firebasePromise().then((app) => {
        try {
            const uid = app.auth().currentUser.uid;

            return new Promise((resolve, reject) => {
                app.database().ref('/model/' + modelId).once('value').then(
                    (model) => { resolve(model.val()); },
                    (error) => { resolve(null); }
                );
            });
        } catch (exception) {
            return false;
        }
    });
}