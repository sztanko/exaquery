import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
//import * as serviceWorker from "./serviceWorker";
import { BrowserRouter as Router, Route } from "react-router-dom";
//import loggerPlugin from 'router5/plugins/logger'
//import browserPlugin from 'router5/plugins/browser'

const AppRouter = () => (
  <Router>
    <div>
      <Route path="/:from_ts?/:to_ts?/:id?" component={App} />
    </div>
  </Router>
);

//console.log(AppWithRouter);

ReactDOM.render(<AppRouter />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
//serviceWorker.unregister();
