import React from 'react';
import { Link } from 'react-router';
import { RouteHandler } from 'react-router';

// Provides global navigation for app e.g. the "Hello | Styleguide" at the top.
// <header><Link to="graph">Exagraph</Link></header>
export default React.createClass({
  displayName: 'Exagraph',
  render() {
    return (
      <div>
        <RouteHandler {...Object.assign({}, this.props)} />
      </div>
    );
  }
});
