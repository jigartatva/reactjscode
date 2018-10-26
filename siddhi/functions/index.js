/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const functions = require('firebase-functions');
const request = require('request');
const app = require('express')();
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Helmet = require('react-helmet');
// React App
const ServerApp = React.createFactory(require('./build/server.bundle.js').default);
const template = require('./template');

// Server-side Data Loading
const database = require('./firebase-database');

// Helper function to get the markup from React, inject the initial state, and
// send the server-side markup to the client
const renderApplication = (url, res, initialState) => {
  const html = ReactDOMServer.renderToString(ServerApp({ url: url, context: {}, initialState }));
  const reduxState = JSON.stringify(initialState);
  //const helmetData = Helmet.constructor.rewind();
  const helmetData = { title: "", meta: "" };
  const analyticsID = initialState.analytics && initialState.analytics.googleanalytics;
  const templatedHtml = template({ body: html, initialState: JSON.stringify(reduxState), helmetData: helmetData, analytics: analyticsID });
  res.send(templatedHtml);
};

// app.use('*/assets', app.static(path.resolve(__dirname, '../assets')));

app.get('/favicon.ico', (req, res) => {
  return res.send(204);
});

app.get('/sw-import.js?*', (req, res) => {
  return res.set({
    'Content-Type': 'text/javascript'
  }).send('');
});

app.get('/*', (req, res) => {
  res.set('Cache-Control', 'public, max-age=60, s-maxage=180');
  return database.getAllContent().then((resp) => {
    return renderApplication(req.url, res, resp);
  });
});
exports.app = functions.https.onRequest(app);
