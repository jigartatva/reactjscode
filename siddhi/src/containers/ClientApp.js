import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';

ReactDOM.hydrate((
  <BrowserRouter>
    <Layout state={window.__initialState} />
  </BrowserRouter>
), document.getElementById('app'));