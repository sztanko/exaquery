import React from 'react';
import Router from 'react-router';
import moment from 'moment';
import $ from 'jquery';
import d3 from 'd3';
import Channel from './components/channel';
import TimeScale from './components/timescale';
import ChannelList from './components/channellist';
import Popup from './components/popup2';
import Controls from './components/controls';
import Graph from './components/graph';
window.jq = $;
window.moment = moment;
window._ = require('lodash');
const dataloader = require('./dataloader');
window.process = process;
window.d3 = d3;

export default React.createClass({
  displayName: 'Exagraph',
  mixins: [Router.State, Router.Navigation],
  getDefaultProps() {
    const view = {
      width: $(document).width(),
      leftWidth: 250,
      rowHeight: 12,
      timeScaleHeight: 20,
      rowPadding: 0.3,
      channelPadding: 1.5,
      buffer: 1.5 //How much view should be cached before rerendering view
    };
    const controls = {
      minDuration: 20,
      maxDuration: 5 * 3600 * 1000 //5 hours
    };
    const url = '';
    //max_ts = 1419438269268
    const max_ts = new Date().getTime();
    const min_ts = max_ts - 3600 * 1000;
    return {
      view,
      min_ts,
      max_ts,
      controls,
      url: 'http://api.hotpanel.mlan:5012/'
    };
  },

  getInitialState() {
    return {
      popup: {
        visible: false
      },
      loaded: false,
      isLoading: false,
      lastUpdate: new Date().getTime()
    };
  },

  componentWillMount() {
    this.setState({ loaded: false, channels: [] });

    this.db = new dataloader.DataLoader(this.props.url);
    const t = this;
    if (this.props.params.fromTs && this.props.params.toTs) {
      return t.zoomTo(this.props.params.fromTs, this.props.params.toTs, true);
    } else {
      return t.zoomTo(this.props.min_ts, this.props.max_ts, true);
    }
  },
  //@db.getData(@props.min_ts, @props.max_ts, @props.view.buffer, (channels) ->
  //    window.data = channels
  //    t.setState({loaded: true, channels: channels, min_ts: t.props.min_ts, max_ts: t.props.max_ts})
  //    return
  //)
  componentWillReceiveProps(np) {
    console.log('Receiving new props');
    //console.log(newProps)
    this.zoomTo(+np.params.fromTs, +np.params.toTs, true);
    return true;
  },

  showInfo(renderer, event) {
    console.log('rendering info');
    const popup = {
      contentRenderer: renderer,
      event,
      visible: true,
      focused: false
    };
    //console.log(event)
    return this.setState({ popup });
  },
  hideInfo() {
    const { popup } = this.state;
    //console.log("Hiding popup")
    popup.visible = false;
    return this.setState({ popup });
  },
  zoomTo(from, to, doNotChangeUrl) {
    console.log(`Zooming from ${from} to ${to}`);
    let duration = to - from;
    duration = Math.min(
      this.props.controls.maxDuration,
      Math.max(duration, this.props.controls.minDuration)
    );
    from = to - duration;
    from = Math.round(from);
    to = Math.round(to);
    this.setState({ min_ts: from, max_ts: to });
    const t = this;
    return this.db.getData(from, to, this.props.view.buffer, function(
      channels,
      isLoading
    ) {
      window.data = channels;
      //t.zoomTo(min_ts, max_ts)
      const { popup } = t.state;
      popup.visible = false;
      popup.focused = false;
      //console.log("Received new data")
      const lastUpdate = new Date().getTime();
      t.setState({ loaded: true, isLoading, channels, popup, lastUpdate });
      if (!doNotChangeUrl) {
        t.transitionTo('graph', { fromTs: from, toTs: to });
      }
    });
  },
  onPopupFocusChange(focus) {
    console.log(`Changing focus to ${focus}`);
    const { popup } = this.state;
    popup.focused = focus;
    return this.setState({ popup });
  },

  render() {
    if (!this.state.loaded) {
      return (
        <div className="exagraph loading">
          <h1>Loading data</h1>
        </div>
      );
    }

    return (
      <div className="exagraph">
        <Popup
          visible={this.state.popup.visible}
          contentRenderer={this.state.popup.contentRenderer}
          event={this.state.popup.event}
          onFocusEvent={this.onPopupFocusChange}
        />
        <Controls
          min_ts={this.state.min_ts}
          max_ts={this.state.max_ts}
          settings={this.props.controls}
          onChange={this.zoomTo}
          isLoading={this.state.isLoading}
        />
        <Graph
          data={this.state.channels}
          settings={this.props.view}
          showInfo={this.showInfo}
          hideInfo={this.hideInfo}
          onChange={this.zoomTo}
          min_ts={this.state.min_ts}
          max_ts={this.state.max_ts}
          lastUpdate={this.state.lastUpdate}
          freeze={this.state.popup.focused}
        />
      </div>
    );
  }
});
