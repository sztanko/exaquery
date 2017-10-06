import React from 'react';

const ChannelList = React.createClass({
  displayName: 'ChannelList',
  render() {
    const height = this.props.view.rowHeight;
    const { props } = this;
    let totalHeight = 0;
    const { channelPadding } = this.props.view;
    const channelNames = _(this.props.data)
      .map(function(d, groupIndex) {
        const textPos = height * (d.channels.length + channelPadding);
        totalHeight += textPos;
        const tr = `translate(0,${height * d.index +
          groupIndex * height * channelPadding})`;
        return (
          <g transform={tr} key={d.index} className="channelName">
            <rect x={0} y={0} height={textPos} width={props.view.width} />
            <text y={textPos / 2} x="15">
              {d.key}
            </text>
          </g>
        );
      })
      .value();

    return (
      <g
        className="channelList"
        transform={`translate(0,${this.props.view.timeScaleHeight})`}
      >
        <rect
          x={0}
          y={0}
          height={totalHeight}
          width={this.props.width}
          className="background"
        />
        {channelNames}
      </g>
    );
  }
});
export default ChannelList;
