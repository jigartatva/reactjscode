import React from 'react';
import { StaticRouter } from 'react-router-dom';
import Layout from '../components/Layout';

export default class ServerApp extends React.Component {
  render() {
    return (
      <StaticRouter location={this.props.url} context={this.props.context}>
        <Layout state={this.props.initialState} />
      </StaticRouter>
    );
  }
}
