import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import "./components/exaquery/event.scss";
import QueryInfo from "./components/exaquery/QueryInfo";
import { BrowserRouter as Router, Route } from "react-router-dom";

const API = process.env.REACT_APP_API_URL; //"/api/exaquery/"; //http://127.0.0.1:5000

/*  This is a temporary workaround until https://github.com/facebook/react/issues/14856 is fixed

START OF THE TEMPORARY WORKAROND

*/
const EVENTS_TO_MODIFY = [
  "touchstart",
  "touchmove",
  "touchend",
  "touchcancel",
  "wheel"
];

const originalAddEventListener = document.addEventListener.bind();
document.addEventListener = (type, listener, options, wantsUntrusted) => {
  let modOptions = options;
  if (EVENTS_TO_MODIFY.includes(type)) {
    if (typeof options === "boolean") {
      modOptions = {
        capture: options,
        passive: false
      };
    } else if (typeof options === "object") {
      modOptions = {
        ...options,
        passive: false
      };
    }
  }

  return originalAddEventListener(type, listener, modOptions, wantsUntrusted);
};

const originalRemoveEventListener = document.removeEventListener.bind();
document.removeEventListener = (type, listener, options) => {
  let modOptions = options;
  if (EVENTS_TO_MODIFY.includes(type)) {
    if (typeof options === "boolean") {
      modOptions = {
        capture: options,
        passive: false
      };
    } else if (typeof options === "object") {
      modOptions = {
        ...options,
        passive: false
      };
    }
  }
  return originalRemoveEventListener(type, listener, modOptions);
};

/*
END OF THE TEMPORARY WORKAROUND
*/

console.log(
  `API is ${API}, env is ${
    process.env.NODE_ENV
  }, env var is ${"REACT_APP_API_URL_" + process.env.NODE_ENV}`
);

function ExaQueryApp(props) {
  return <App {...props} popupContent={QueryInfo} api={API} />;
}

const AppRouter = () => (
  <Router>
    <div>
      <Route path="/:from_ts?/:to_ts?/:id?" component={ExaQueryApp} />
    </div>
  </Router>
);

//console.log(AppWithRouter);

ReactDOM.render(<AppRouter />, document.getElementById("root"));
