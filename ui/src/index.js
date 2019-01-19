import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import "./components/exaquery/event.scss";
import QueryInfo from "./components/exaquery/QueryInfo";
import { BrowserRouter as Router, Route } from "react-router-dom";

const API = process.env.REACT_APP_API_URL; //"/api/exaquery/"; //http://127.0.0.1:5000

console.log(
  `API is ${API}, env is ${
    process.env.NODE_ENV
  }, env var is ${"REACT_APP_API_URL_" + process.env.NODE_ENV}`
);

function ExaQueryApp(props){
  return <App {...props} popupContent={QueryInfo} api={API}/>
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
