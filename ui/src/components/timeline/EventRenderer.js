import React from "react";
import {
  CHANNEL_HEIGHT,
  CHANNEL_PADDING,
  channelYScale
} from "../../modules/constants";

function EventRenderer(data, scaleX, onEventClick) {
  let x = scaleX(data.start_time);
  let y = channelYScale(data.offset, data.group_id) + CHANNEL_PADDING;
  let width = scaleX(data.stop_time) - x;
  let height = CHANNEL_HEIGHT - 2 * CHANNEL_PADDING;
  const cls = `event ${data.modifier} ${data.flag === 1 ? "flag" : "noflag"}`;
  let onClick = e => {};
  if (data.modifier !== "EVENT_GROUP")
    onClick = e => {
      onEventClick(data.box_id, e);
    };
  return (
    <rect
      vectorEffect="non-scaling-stroke"
      key={data.group + "_" + data.box_id + "_" + data.modifier}
      className={cls}
      x={x}
      y={y}
      width={width}
      height={height}
      onClick={onClick}
    />
  );
}

export default EventRenderer;
