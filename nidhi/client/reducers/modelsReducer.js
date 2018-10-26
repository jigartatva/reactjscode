import _ from 'lodash';
import { handleActions } from 'redux-actions';

const initialState = {

};

export default handleActions({

    /**
     * @param {Object} state
     * @param {Object} action
     * @param {String} action.modelId
     */
    ACTION_MODELS_NEW (state, action) {
        return { ...state, ...action };
    },

    /**
     * @param {Object} state
     * @param {Object} action
     * @param {Array} action.models
     */
    ACTION_MODELS_LIST (state, action) {
        return { ...state, ...action };
    },

    /**
     * @param {Object} state
     * @param {Object} action
     * @param {Array} action.models
     */
    ACTION_TEMPLATE_MODELS_LIST (state, action) {
        return { ...state, ...action };
    },

    /**
     * @param {Object} state
     * @param {Object} action
     * @param {Array} action.models
     */
    ACTION_MODELS_DELETE (state, action) {
        return { ...state, ...action };
    },


    /**
     * @param {Object} state
     * @param {Object} action
     * @param {String} action.modelId
     */
    ACTION_MODELS_DUPLICATE (state, action) {
        return { ...state, ...action };
    },

    /**
     * @param {Object} state
     * @param {Object} action
     * @param {String} action.modelId
     */
    ACTION_GET_USER_STRIPE_DATA (state, action) {
        return { ...state, ...action };
    },
}, initialState)
