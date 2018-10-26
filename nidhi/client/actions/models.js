import {
    firebasePromise,
    modelsNew as firebaseModelsNew,
    modelsAll as firebaseModelsAll,
    templateModelsAll as firebaseTemplateModelsAll,
    modelsLoad as firebaseModelsLoad,
    modelsLoadForShare as firebaseShareModelLoad,
    modelsDelete as firebaseModelsDelete,
    modelsDuplicate as firebaseModelsDuplicate,
    modelsLoadOnModify as firebaseModelsLoadOnModify,
    modelSetPermission as firebasemodelSetPermission,
    modelGetPermission as firebaseModelGetPermission,
    setCheckboxValue as firebaseSetCheckboxValue,
    getCheckboxValue as firebaseGetCheckboxValue,
    setNewModelCheckboxValue as firebaseSetNewModelCheckboxValue,
    getNewModelCheckboxValue as firebaseGetNewModelCheckboxValue,
    userStripedata as firebaseStripedata,
} from '../services/firebase';

import {
    ACTION_STATUS_REQUEST,
    ACTION_STATUS_SUCCESS,
    ACTION_STATUS_FAIL,
    ACTION_MODELS_NEW,
    ACTION_MODELS_SET_PERMISSION,
    ACTION_MODELS_GET_PERMISSION,
    ACTION_SET_CHECKBOX_VALUE,
    ACTION_GET_CHECKBOX_VALUE,
    ACTION_SET_NEW_MODEL_CHECKBOX_VALUE,
    ACTION_GET_NEW_MODEL_CHECKBOX_VALUE,
    ACTION_MODELS_LIST,
    ACTION_MODELS_LOAD,
    ACTION_MODELS_NAME,
    ACTION_MODELS_DELETE,
    ACTION_MODELS_DUPLICATE,
    ACTION_MODELS_REFRESH,
    ACTION_SAVE_UPLOADED_FILES,
    ACTION_MATADATA_UPDATE_UPLOADED_FILES,
    ACTION_TEMPLATE_MODELS_LIST,
    ACTION_MODELS_SET_PINNED,
    ACTION_GET_USER_STRIPE_DATA,
} from '../constants.js';

import { LOGIN_ERRORS } from '../constants/messages';

/**
 * @returns {function}
 */
export function modelsNew() {

    return (dispatch, getState) => {
        dispatch({
            type: ACTION_MODELS_NEW,
            actionStatus: ACTION_STATUS_REQUEST
        });

        firebaseModelsAll();
        return firebaseModelsNew().then(
            (modelId) => {
                return dispatch({ type: ACTION_MODELS_NEW, actionStatus: ACTION_STATUS_SUCCESS, modelId });
            },
            (error) => {
                return dispatch({ type: ACTION_MODELS_NEW, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}
/**
 * @returns {function}
 */
export function setModelPermission(modelId, permission) {
    return (dispatch, getState) => {
        dispatch({
            type: ACTION_MODELS_SET_PERMISSION,
            actionStatus: ACTION_STATUS_REQUEST
        });

        return firebasemodelSetPermission(modelId, permission).then(
            (modelId) => {
                return dispatch({ type: ACTION_MODELS_SET_PERMISSION, actionStatus: ACTION_STATUS_SUCCESS, modelId });
            },
            (error) => {
                return dispatch({ type: ACTION_MODELS_SET_PERMISSION, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}

export function getModelPermission(modelId) {

        return (dispatch, getState) => {
            dispatch({
                type: ACTION_MODELS_GET_PERMISSION,
                actionStatus: ACTION_STATUS_REQUEST
            });

            return firebaseModelGetPermission(modelId).then(
                (permission) => {
                    return dispatch({
                        type: ACTION_MODELS_GET_PERMISSION,
                        actionStatus: ACTION_STATUS_SUCCESS,
                        permission
                    });
                },
                (error) => {
                    return dispatch({ type: ACTION_MODELS_GET_PERMISSION, actionStatus: ACTION_STATUS_FAIL, error })
                }
            );
        }
    }

/**
 * @returns {function}
 */
export function setCheckBox(checkValue) {
    return (dispatch, getState) => {
        dispatch({
            type: ACTION_SET_CHECKBOX_VALUE,
            actionStatus: ACTION_STATUS_REQUEST
        });

        return firebaseSetCheckboxValue(checkValue).then(
            (checkValue) => {
                return dispatch({ type: ACTION_SET_CHECKBOX_VALUE, actionStatus: ACTION_STATUS_SUCCESS, checkValue });
            },
            (error) => {
                return dispatch({ type: ACTION_SET_CHECKBOX_VALUE, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}

export function getCheckBox(){
    return (dispatch, getState) => {
        dispatch({
            type: ACTION_GET_CHECKBOX_VALUE,
            actionStatus: ACTION_STATUS_REQUEST
        });

        return firebaseGetCheckboxValue().then(
            (checkValue) => {
                return dispatch({
                    type: ACTION_GET_CHECKBOX_VALUE,
                    actionStatus: ACTION_STATUS_SUCCESS,
                    checkValue
                });
            },
            (error) => {
                return dispatch({ type: ACTION_GET_CHECKBOX_VALUE, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}
/**
 * @returns {function}
 */
export function setModelTipsCheckBox(modelCheckValue) {
    return (dispatch, getState) => {
        dispatch({
            type: ACTION_SET_NEW_MODEL_CHECKBOX_VALUE,
            actionStatus: ACTION_STATUS_REQUEST
        });

        return firebaseSetNewModelCheckboxValue(modelCheckValue).then(
            (modelCheckValue) => {
                return dispatch({ type: ACTION_SET_NEW_MODEL_CHECKBOX_VALUE, actionStatus: ACTION_STATUS_SUCCESS, modelCheckValue });
            },
            (error) => {
                return dispatch({ type: ACTION_SET_NEW_MODEL_CHECKBOX_VALUE, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}

export function getModelTipsCheckBox(){
    return (dispatch, getState) => {
        dispatch({
            type: ACTION_GET_NEW_MODEL_CHECKBOX_VALUE,
            actionStatus: ACTION_STATUS_REQUEST
        });

        return firebaseGetNewModelCheckboxValue().then(
            (modelCheckValue) => {
                return dispatch({
                    type: ACTION_GET_NEW_MODEL_CHECKBOX_VALUE,
                    actionStatus: ACTION_STATUS_SUCCESS,
                    modelCheckValue
                });
            },
            (error) => {
                return dispatch({ type: ACTION_GET_NEW_MODEL_CHECKBOX_VALUE, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}

/**
 * @returns {function}
 */
export function modelsList() {

    return (dispatch, getState) => {
        dispatch({
            type: ACTION_MODELS_LIST,
            actionStatus: ACTION_STATUS_REQUEST
        });

        return firebaseModelsAll().then(
            (models) => {
                return dispatch({ type: ACTION_MODELS_LIST, actionStatus: ACTION_STATUS_SUCCESS, models });
            },
            (error) => {
                return dispatch({ type: ACTION_MODELS_LIST, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}

/**
 * @returns {function}
 */
export function templateModelsList(adminUserId) {
    return (dispatch, getState) => {
        dispatch({
            type: ACTION_TEMPLATE_MODELS_LIST,
            actionStatus: ACTION_STATUS_REQUEST
        });

        return firebaseTemplateModelsAll(adminUserId).then(
            (models) => {
                return dispatch({ type: ACTION_TEMPLATE_MODELS_LIST, actionStatus: ACTION_STATUS_SUCCESS, templates: models });
            },
            (error) => {
                return dispatch({ type: ACTION_TEMPLATE_MODELS_LIST, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}

/**
 * @param {string} modelId
 * @returns {function}
 */
export function modelsLoad(modelId) {

    return (dispatch, getState) => {
        dispatch({
            type: ACTION_MODELS_LOAD,
            actionStatus: ACTION_STATUS_REQUEST,
            modelId
        });

        return firebaseModelsLoad(modelId).then(
            (model) => {
                return dispatch({ type: ACTION_MODELS_LOAD, actionStatus: ACTION_STATUS_SUCCESS, model });
            },
            (error) => {
                return dispatch({ type: ACTION_MODELS_LOAD, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}

export function shareModelLoad(modelId) {
    return (dispatch, getState) => {
        dispatch({
            type: ACTION_MODELS_LOAD,
            actionStatus: ACTION_STATUS_REQUEST,
            modelId
        });

        return firebaseShareModelLoad(modelId).then(
            (model) => {
                return dispatch({ type: ACTION_MODELS_LOAD, actionStatus: ACTION_STATUS_SUCCESS, model });
            },
            (error) => {
                return dispatch({ type: ACTION_MODELS_LOAD, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }

}

/**
 * @param {string} modelId
 * @returns {function}
 */
export function modelsDelete(modelId) {

    return (dispatch, getState) => {
        dispatch({
            type: ACTION_MODELS_DELETE,
            actionStatus: ACTION_STATUS_REQUEST,
            modelId
        });

        return firebaseModelsDelete(modelId).then(
            (model) => {
                return dispatch({ type: ACTION_MODELS_DELETE, actionStatus: ACTION_STATUS_SUCCESS, modelId });
            },
            (error) => {
                return dispatch({ type: ACTION_MODELS_DELETE, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}

/**
 * @param {string} modelId
 * @param {string} name
 * @returns {function}
 */
export function modelsDuplicate(modelId, name) {

    return (dispatch, getState) => {
        dispatch({
            type: ACTION_MODELS_DUPLICATE,
            actionStatus: ACTION_STATUS_REQUEST,
            modelId
        });

        return firebaseModelsDuplicate(modelId, name).then(
            (newModelId) => {
                return dispatch({ type: ACTION_MODELS_DUPLICATE, actionStatus: ACTION_STATUS_SUCCESS, modelId: newModelId });
            },
            (error) => {
                return dispatch({ type: ACTION_MODELS_DUPLICATE, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}

/**
 * @param {string} name
 * @returns {function}
 */
export function modelsName(name) {
    return {
        type: ACTION_MODELS_NAME,
        name
    }
}
/**
 * @param {string} modelId
 * @param {string} isPinned
 * @returns {function}
 */

export function modelSetPinned(isPinned) {
    return {
        type: ACTION_MODELS_SET_PINNED,
        isPinned
    }
}
/**
 * @param {string} modelId
 * @returns {function}
 */
export function modelsLoadOnModify(modelId) {
    return (dispatch, getState) => {
        dispatch({
            type: ACTION_MODELS_LOAD,
            actionStatus: ACTION_STATUS_REQUEST,
            modelId
        });

        return firebaseModelsLoadOnModify(modelId).then(

            (model) => {
                return dispatch({ type: ACTION_MODELS_REFRESH, actionStatus: ACTION_STATUS_SUCCESS, model });
            },
            (error) => {
                return dispatch({ type: ACTION_MODELS_REFRESH, actionStatus: ACTION_STATUS_FAIL, error })
            }
        );
    }
}
// Get Logged in User's Stripe data
export function getStripeData(){  
    return (dispatch, getState) => {
        dispatch({
            type: ACTION_GET_USER_STRIPE_DATA,
            actionStatus: ACTION_STATUS_REQUEST
        });
        return firebaseStripedata().then(
            (data) => {
                if (_.isObject(data)) {
                    return dispatch({
                        type: ACTION_GET_USER_STRIPE_DATA,
                        actionStatus: ACTION_STATUS_SUCCESS,
                        planid: data.plan,
                        productid: data.product
                    });
                } else {
                    return dispatch({
                        type: ACTION_GET_USER_STRIPE_DATA,
                        actionStatus: ACTION_STATUS_FAIL,
                    });
                }
            }
        );
    }  
}
