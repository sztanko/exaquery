import React, { Component } from "react";
import PropTypes from "prop-types";
import "./TimeLine.css";
import addChannelInfo from "../../modules/ChannelBuilder";
import ChannelSpace from "./ChannelSpace";
import GestureHandler from "./GestureHandler";
import DefaultEventRenderer from "./EventRenderer";
import TimeAxis from "./TimeAxis";
import {
  GROUP_LIST_WIDTH,
  GROUP_PADDING,
  channelYScale
} from "../../modules/constants";

function Group(props) {
  const group_y =
    channelYScale(props.data.offset, props.data.index) - GROUP_PADDING;
  // props.data.offset * CHANNEL_HEIGHT + props.data.index * GROUP_PADDING * 2 + GROUP_PADDING;
  const height =
    channelYScale(props.data.offset + props.data.size, props.data.index) -
    group_y +
    GROUP_PADDING;
  //const height = channelYScale(props.data.offset + props.data.size, props.data.index) - group_y + GROUP_PADDING;
  return (
    <g className="group">
      <rect x={0} y={group_y} width={GROUP_LIST_WIDTH} height={height} />
      <line
        x1={GROUP_LIST_WIDTH}
        y1={group_y + height}
        x2={props.width}
        y2={group_y + height}
      />
      <text x={10} y={group_y + height / 2} alignmentBaseline="middle">
        {props.data.group}
      </text>
    </g>
  );
}
function GroupList(props) {
  const groups = props.groups.map(group => (
    <Group key={group.group} width={props.width} data={group} />
  ));
  return groups;
}

class TimeLine extends Component {
  static defaultProps = {
    eventRenderer: DefaultEventRenderer,
    data: [],
    data_ts: 0
  };

  static propTypes = {
    start_ts: PropTypes.number.isRequired,
    stop_ts: PropTypes.number.isRequired,
    padding: PropTypes.number,
    width: PropTypes.number.isRequired,
    eventRenderer: PropTypes.func,
    data: PropTypes.array,
    data_ts: PropTypes.number,
    onChange: PropTypes.func,
    onEventClick: PropTypes.func
  };

  onChange(zoom, offset) {
    const width = this.props.stop_ts - this.props.start_ts; // time in sec
    const new_width = width / zoom; // new time in sec
    const new_offset = (offset / (this.props.width - GROUP_LIST_WIDTH)) * width;
    
    this.props.onChange(
      this.props.start_ts + new_offset,
      this.props.start_ts + new_width + new_offset
    );
  }

  render() {
    const [groups, numChannels] = addChannelInfo(this.props.data);
    const height = channelYScale(numChannels, groups.length);
    const total_height = height + 50;
    const onChange = (x, y) => this.onChange(x, y);
    // numChannels * CHANNEL_HEIGHT + groups.length * GROUP_PADDING + 50;
    return (
      <div className="TimeLine">
        <svg width={this.props.width} height={total_height}>
          <defs>
            <pattern
              id="hashes"
              patternUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="2"
              height="2"
            >
              <rect
                className="hashBackground"
                x="0"
                y="0"
                width="3"
                height="3"
              />
              <line className="hashLine" x1="0" y1="0" x2="0" y2="3" />
              <line className="hashLine" x1="0" y1="0" x2="2" y2="0" />
            </pattern>
          </defs>

          <g
            className="zoomable"
            transform={`translate(${GROUP_LIST_WIDTH}, 0)`}
          >
            <GestureHandler onChange={onChange}>
              <TimeAxis
                width={this.props.width - GROUP_LIST_WIDTH}
                start_ts={this.props.start_ts}
                stop_ts={this.props.stop_ts}
                height={height}
              />
              <g transform="translate(0,25)">
                <ChannelSpace
                  {...this.props}
                  width={this.props.width - GROUP_LIST_WIDTH}
                />
              </g>
            </GestureHandler>
          </g>
          <g className="channelList" transform="translate(0,25)">
            <GroupList groups={groups} width={this.props.width} />
          </g>
        </svg>
        
      </div>
    );
  }
}

export default TimeLine;
