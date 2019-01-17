import React from "react";
import { Axis, axisPropsFromTickScale, TOP } from "react-d3-axis";
import { scaleTime } from "d3-scale";

function TimeAxis(props) {
  const numTicks = 15;
  const scale = scaleTime()
    .domain([new Date(props.start_ts * 1000), new Date(props.stop_ts * 1000)])
    .range([0, props.width]);
  const timeLines = scale.ticks(numTicks).map(tick => {
    return (
      <line
        vectorEffect="non-scaling-stroke"
        key={`tick_${scale(tick)}`}
        x1={scale(tick)}
        x2={scale(tick)}
        y1={0}
        y2={props.height}
      />
    );
  });
  return (
    <g transform="translate(0,25)">
      <Axis
        {...axisPropsFromTickScale(scale, numTicks)}
        style={{ orient: TOP }}
      />
      <g className="timeLines">{timeLines}</g>
    </g>
  );
}

export default TimeAxis;
