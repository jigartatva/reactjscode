import React from 'react';
import { Router, Route, IndexRoute } from 'react-router';
import RootContainer from './containers/RootContainer';
import IndexContainer from './containers/IndexContainer';
import ModelsContainer from './containers/ModelsContainer';

export default (
    <Route path="/" component={RootContainer}>
        <IndexRoute component={IndexContainer} />
        <Route path="/models" component={ModelsContainer} />
    </Route>
)
