import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import { browserHistory } from 'react-router'
import { routerMiddleware } from 'react-router-redux'
import thunk from 'redux-thunk';
import logger from '../middleware/logger.js';
import rootReducer from '../reducers/root-reducer.js';
import Reactotron from "reactotron-react-js";

export default function configureStore(initialState) {

    //const createStore = Reactotron.createStore;
    const create = window.devToolsExtension ? window.devToolsExtension()(createStore) : createStore;
    const createStoreWithMiddleware = applyMiddleware(
        thunk,
        routerMiddleware(browserHistory),
        logger
    )(create);
    const store = createStoreWithMiddleware(rootReducer, initialState);

    if (module.hot) {
        module.hot.accept('../reducers/root-reducer.js', () => {
            const nextReducer = require('../reducers/root-reducer.js');
            store.replaceReducer(nextReducer);
        })
    }

    return store;
}
