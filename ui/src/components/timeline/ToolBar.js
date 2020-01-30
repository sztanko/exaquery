import React, { Component } from "react";
import PropTypes from "prop-types";
import moment from "moment-es6";
import "moment-precise-range-plugin";
import DateTimePicker from "react-datetime-picker";
import "./ToolBar.scss";

const AUTO_REFRESH_TIMEOUT = 1100;

function getTimeInterval(val) {
  const now = new Date().getTime() / 1000;
  return [now - val, now];
}

const timeIntervals = [
  { title: "5m", value: 5 * 60 },
  { title: "15m", value: 15 * 60 },
  { title: "30m", value: 30 * 60 },
  { title: "1h", value: 60 * 60 },
  { title: "3h", value: 3 * 3600 },
  { title: "6h", value: 6 * 3600 },
  { title: "12h", value: 12 * 3600 },
  { title: "24h", value: 24 * 3600 }
  // { title: "72h", value: 72 * 3600 }
];

class ToolBar extends Component {
  state = {
    autoRefresh: false
  };
  static propTypes = {
    changeTs: PropTypes.func,
    from_ts: PropTypes.number,
    to_ts: PropTypes.number,
    onChangeSearch: PropTypes.func,
    onFlushClick: PropTypes.func
  };

  onDateChange = value => {
    const delta = this.props.to_ts - this.props.from_ts;
    const start = value.getTime() / 1000;
    this.props.changeTs(start, start + delta);
  };

  onChangeSearch = q => {
    this.props.onChangeSearch(q.target.value);
  };

  onRefresh = () => {
    if (this.state.autoRefresh) {
      console.log("Refreshing the page");
      //window.setTimeout(this.onRefresh, AUTO_REFRESH_TIMEOUT);
      const newTime =
        new Date().getTime() / 1000 - (this.props.to_ts - this.props.from_ts);
      this.onDateChange(new Date(newTime * 1000));
    }
    this.timerHandle = setTimeout(this.onRefresh, AUTO_REFRESH_TIMEOUT);
  };

  componentDidMount = () => {
    this.onRefresh(); // ***
  };

  componentWillUnmount = () => {
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = 0;
    }
  };

  render() {
    //console.log("Channels Render");

    const links = timeIntervals.map(k => {
      const [from_ts, to_ts] = getTimeInterval(k.value);
      const onClick = event => {
        console.log("OnClick");
        const [from_ts, to_ts] = getTimeInterval(k.value);
        this.props.changeTs(from_ts, to_ts);
        event.preventDefault();
      };
      return (
        <li key={k.title}>
          <a href={`/${from_ts}/${to_ts}`} onClick={onClick}>
            {k.title}
          </a>
        </li>
      );
    });
    const from_date = new Date(this.props.from_ts * 1000);
    const start_dt = moment(from_date);
    const stop_dt = moment(this.props.to_ts * 1000);
    const autoRefresh = this.state.autoRefresh || false;
    const toggleAutoRefresh = event =>
      this.setState({ autoRefresh: event.target.checked });
    const toolBar = (
      <div className="ToolBar">
        <div className="searchBox panel">
          <input
            type="text"
            onChange={this.onChangeSearch}
            value={this.props.q}
            placeholder="Search"
          />
        </div>
        
        <div className="datePicker panel">
          Range is {start_dt.preciseDiff(stop_dt)}, starting from
          <DateTimePicker onChange={this.onDateChange} value={from_date} />
        </div>
        <div className="quickLinks panel">
          Jump to last: <ul>{links}</ul>
          <label>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={toggleAutoRefresh}
            />
            Auto Refresh
          </label>
          <button onClick={this.props.onFlushClick}>Flush statistics</button>
          &nbsp;(V0.12)
        </div>
      </div>
    );
    return toolBar;
  }
}

export default ToolBar;
