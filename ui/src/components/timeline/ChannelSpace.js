import React, { Component } from "react";
import PropTypes from "prop-types";
import { scaleLinear } from "d3-scale";

class ChannelSpace extends Component {
  static defaultProps = {
    eventRenderer: null,
    //data: [],
    lastUpdate: new Date(0)
  };

  static propTypes = {
    start_ts: PropTypes.number.isRequired,
    stop_ts: PropTypes.number.isRequired,
    padding: PropTypes.number,
    width: PropTypes.number.isRequired,
    eventRenderer: PropTypes.func,
    data: PropTypes.array,
    lastUpdate: PropTypes.object,
    onEventClick: PropTypes.func
  };

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.lastUpdate > this.props.lastUpdate;
  }

  render() {
    //console.log("Channels Render");
    let scaleX = scaleLinear()
      .domain([this.props.start_ts, this.props.stop_ts])
      .range([0, this.props.width]);
    let items = null;
    if (this.props.data.length) {
      items = this.props.data.map(d =>
        this.props.eventRenderer(d, scaleX, this.props.onEventClick)
      );
    }
    return <g className="ChannelSpace">{items}</g>;
  }
}

export default ChannelSpace;
