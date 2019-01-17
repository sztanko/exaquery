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
  const onClick = (e) => {
     // console.log("CLickkkk")
     onEventClick(data.box_id, e);
  };
  //console.log(cls);
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
  // `Group: ${data.group}, Offset: ${data.offset}, channel: ${data.channel}`)}
}

export default EventRenderer;
