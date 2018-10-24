import React from 'react';

import Channel from './channel';
import TimeScale from './timescale';
import ChannelList from './channellist';
import _ from 'lodash';
import d3 from 'd3';
import Draggable from './draggable';
const ViewPort = React.createClass({
  displayName: 'ViewPort',
  shouldComponentUpdate(np, ns) {
    const nd = np.timeScale.domain();
    const d = this.props.timeScale.domain();
    if (
      nd[0] === d[0] &&
      nd[1] === d[1] &&
      np.lastUpdate === this.props.lastUpdate
    ) {
      return false;
    }
    return true;
  },
  render() {
    const { timeScale } = this.props;
    const t = this;
    const channels = _(this.props.data)
      .map('channels')
      .map((d, i) =>
        _(d)
          .map(function(dd) {
            dd.group = i;
            return dd;
          })
          .value()
      )
      .flatten()
      .map(d => (
        <Channel
          key={d.index}
          data={d}
          onClick={t.onSessionClick}
          timeScale={t.props.timeScale}
          height={t.props.view.rowHeight}
          rowPadding={t.props.view.rowPadding}
          verticalOffset={
            t.props.view.rowHeight * d.index +
            (d.group + 0.5) *
              (t.props.view.channelPadding * t.props.view.rowHeight)
          }
          showInfo={t.props.showInfo}
          hideInfo={t.props.hideInfo}
          zoomTo={t.props.onChange}
          lastUpdate={t.props.lastUpdate}
        />
      ))
      .value();
    const tickHeight =
      (channels.length +
        this.props.data.length * this.props.view.channelPadding) *
      this.props.view.rowHeight;
    return (
      <g className="ViewPort">
        <TimeScale
          timeScale={timeScale}
          tickHeight={tickHeight}
          height={this.props.view.timeScaleHeight}
        />
        <g
          className="channels"
          transform={`translate(0,${this.props.view.timeScaleHeight})`}
        >
          {channels}
        </g>
      </g>
    );
  }
});

export default React.createClass({
  displayName: 'Graph',
  getTimeScale() {
    const dur = this.props.max_ts - this.props.min_ts;
    const hiddenSpace = this.props.settings.buffer;
    const graphWidth =
      this.props.settings.width - this.props.settings.leftWidth;
    return d3.scale
      .linear()
      .domain([
        this.props.min_ts - dur * hiddenSpace,
        this.props.max_ts + dur * hiddenSpace
      ])
      .rangeRound([
        -hiddenSpace * graphWidth + this.props.settings.leftWidth,
        (hiddenSpace + 1) * graphWidth
      ]);
  },
  handleScroll(tr) {
    const timeScale = this.getTimeScale().invert;
    const ts_delta = Math.round(timeScale(tr) - timeScale(0));
    return this.props.onChange(
      this.props.min_ts - ts_delta,
      this.props.max_ts - ts_delta
    );
  },

  render() {
    const view = this.props.settings;
    const numChannels = _(this.props.data).reduce(
      (count, account) => count + account.channels.length,
      0
    );
    const timeScale = this.getTimeScale();

    const height =
      view.rowHeight * numChannels +
      view.timeScaleHeight +
      view.rowHeight * this.props.data.length * view.channelPadding +
      view.timeScaleHeight;
    return (
      <svg width={view.width} height={height}>
        <Draggable
          onChange={this.handleScroll}
          freeze={this.props.freeze}
          height={height}
          timeScale={timeScale}
        >
          <ViewPort
            data={this.props.data}
            timeScale={timeScale}
            onChange={this.props.onChange}
            showInfo={this.props.showInfo}
            hideInfo={this.props.hideInfo}
            view={view}
            lastUpdate={this.props.lastUpdate}
          />
        </Draggable>
        <ChannelList
          data={this.props.data}
          width={view.leftWidth}
          view={view}
        />
      </svg>
    );
  }
});
