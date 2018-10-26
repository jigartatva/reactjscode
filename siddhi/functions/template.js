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

// Template file that the server will use to inject the React markup and
// initial state before sending it to the client

const template = opts => {
  var analyticsCode = opts.analytics && opts.analytics !== ""
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id= ${opts.analytics}"></script>
    <script>
   window.dataLayer = window.dataLayer || [];
   function gtag(){dataLayer.push(arguments);}
   gtag("js", new Date());
  
   gtag("config", "${opts.analytics}");
  </script>` : ``;

  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no"/>
      <link rel="shortcut icon" href="/assets/images/favicon.png" />
      ${ opts.helmetData.title.toString()}
      ${ opts.helmetData.meta.toString()}
      <link rel="stylesheet" type="text/css" href="/assets/css/app.style.css" />
      ${analyticsCode}
  </head>
  <body>
      <div id="app">${opts.body}</div>
    <script>
      window.__initialState = ${opts.initialState}
    </script>
    <script src="/assets/vendors~client.bundle.js"></script>
    <script src="/assets/client.bundle.js"></script>
    </body>
  </html>
    `;
};

module.exports = template;
