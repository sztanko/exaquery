import React, { Component } from "react";
import PropTypes from "prop-types";
import "./ToolBar.css";

function getTimeInterval(val) {
  const now = new Date().getTime() / 1000;
  return [now - val, now];
}

const timeIntervals = [
  { title: "5m", value: 5 * 60 },
  { title: "15m", value: 15 * 60 },
  { title: "1h", value: 60 * 60 },
  { title: "3h", value: 3 * 3600 },
  { title: "6h", value: 6 * 3600 },
  { title: "12h", value: 12 * 3600 },
  { title: "24h", value: 24 * 3600 },
  { title: "72h", value: 72 * 3600 }
];

class ToolBar extends Component {
  static defaultProps = {
    eventRenderer: null,
    //data: [],
    lastUpdate: new Date(0)
  };

  static propTypes = {
    onClick: PropTypes.func
  };

  render() {
    //console.log("Channels Render");
    const links = timeIntervals.map(k => {
      const [from_ts, to_ts] = getTimeInterval(k.value);
      const onClick = event => {
        console.log("OnClick");
        const [from_ts, to_ts] = getTimeInterval(k.value);
        this.props.onClick(from_ts, to_ts);
        event.preventDefault();
      };
      return (<ul>
        <li key={k.title}>
          <a href={`/${from_ts}/${to_ts}`} onClick={onClick}>
            {k.title}
          </a>
        </li></ul>
      );
    });
    const toolBar = (
      <div className="ToolBar">
        <div className="quickLinks">{links}</div>
      </div>
    );
    return toolBar;
  }
}

export default ToolBar;
