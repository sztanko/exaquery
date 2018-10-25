// Load css first thing. It gets injected in the <head> in a <style> element by
// the Webpack style-loader.
import '../public/main.css';

import React from 'react';
import App from './app';
import ExaGraph from './exastats2';

// Assign React to Window so the Chrome React Dev Tools will work.
window.React = React;

const Router = require('react-router');
const { Route } = Router;
const { DefaultRoute } = Router;

// Require route components.
//        <DefaultRoute handler={ExaGraph} />
//<Route name='graph' handler={ExaGraph} path="/graph" />
const routes = (
  <Route handler={App}>
    <DefaultRoute handler={ExaGraph} />
    <Route name="graph" handler={ExaGraph} path="/graph/:fromTs/:toTs" />
  </Route>
);
Router.run(routes, function(Handler, state) {
  const { params } = state;
  return React.render(<Handler params={params} />, document.body);
});
