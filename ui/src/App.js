import React, { Component } from "react";
import _ from "lodash";
import pathToRegexp from "path-to-regexp";

import "./App.css";
import TimeLine from "./components/timeline/TimeLine";
import Popup from "./components/timeline/Popup";
import ToolBar from "./components/timeline/ToolBar";

const DEFAULT_INITIAL_WINDOW = 600;

export default class App extends Component {
  state = {
    data: [],
    infoData: {},
    lastUpdate: new Date(0),
    isLoading: false,
    q: ""
  };

  constructor() {
    super();
    this.loadEventsDelayed = _.debounce(this.loadEvents.bind(this), 1000);
    this.updateScaleDelayed = _.debounce(this.updateScale.bind(this), 100);
  }

  onChange(start_time, stop_time, force) {
    this.updateScaleDelayed(start_time, stop_time);
    this.loadEventsDelayed(start_time, stop_time, this.state.q, force);
  }

  changeUrl(newParams) {
    const {
      match: { path, params }
    } = this.props;

    const newPath = pathToRegexp.compile(path)({
      ...params,
      ...newParams
    });
    this.props.history.push(newPath);
  }

  errorHandler(e) {
    this.setState({ isLoading: false });
    console.error(`could not load data`);
    console.error(e);
    window.alert("Could not load data");
  }
  getCurrentTimeInterval() {
    const now = new Date().getTime() / 1000;
    const start_ts =
      +this.props.match.params.from_ts || now - DEFAULT_INITIAL_WINDOW;
    const stop_ts = +this.props.match.params.to_ts || now;
    return [start_ts, stop_ts];
  }
  componentDidMount() {
    const [start_ts, stop_ts] = this.getCurrentTimeInterval();
    this.loadEvents(start_ts, stop_ts);
    if (this.props.match.params.id != null) {
      this.loadPopup(this.props.match.params.id);
    }
  }

  updateScale(start_time, stop_time) {
    //this.props.history.push(`/${start_time}/${stop_time}`);
    this.changeUrl({ from_ts: start_time, to_ts: stop_time });
    this.setState({ lastUpdate: new Date() });
  }

  onChangeSearch = q => {
    this.setState({ q: q });
    const [start_ts, stop_ts] = this.getCurrentTimeInterval();
    this.loadEventsDelayed(start_ts, stop_ts, q);
  };

  flush = () => {
    const url = `${this.props.api}flush`;

    if (this.state.isLoading) {
      console.log("Cannot flush while loading");
      return;
    }
    this.setState({ isLoading: true });
    fetch(url, { method: "POST" })
      .then(response => {
        console.log("Flush successfull");
        this.setState({ isLoading: false });
        const [start_time, stop_time] = this.getCurrentTimeInterval();
        const offset = new Date().getTime() / 1000 - stop_time;
        console.log("Flushed, now loading new events");
        this.onChange(
          start_time + offset,
          stop_time + offset,
          this.state.q,
          true
        );
      })
      .catch(this.errorHandler);
  };

  loadEvents(start_time, stop_time, q, force) {
    const window = (stop_time - start_time) / 4;
    const start_ts_window = start_time - window;
    const stop_ts_window = stop_time + window;
    const toleranceThreshold =
      (this.state.lastLoadedStopTime - this.state.lastLoadedStartTime) / 40;

    if (
      !force &&
      this.state.last_q === q &&
      Math.abs(start_time - this.state.lastLoadedStartTime) <
        toleranceThreshold &&
      Math.abs(stop_time - this.state.lastLoadedStopTime) < toleranceThreshold
      // && this.state.data.length>0
    ) {
      console.log("Change not significant enough to load new data");
      return;
    }
    const url = `${
      this.props.api
    }?from=${start_ts_window}&to=${stop_ts_window}&q=${q || ""}`;
    if (this.state.isLoading) {
      console.log("Already loading data, can't cancel it");
      return;
    }

    console.log(`Loading data from ${url}`);

    this.setState({ isLoading: true });
    fetch(url)
      .then(responsePromise => {
        const r = responsePromise.json();
        return r;
      })
      .then(response => {
        console.log("Data loaded");
        const data = response.result;
        const lastUpdate = new Date();
        console.log("Retrieved " + data.length + " events");
        this.setState({
          data: data,
          lastUpdate: lastUpdate,
          isLoading: false,
          lastLoadedStartTime: start_time,
          lastLoadedStopTime: stop_time,
          last_q: q
        });
      })
      .catch(this.errorHandler.bind(this));
  }

  openPopup(box_id, e) {
    //console.log(e.pageY)
    //console.log(e.clientY)

    const mouse_x = e.clientX;
    const max_x = window.innerWidth / 2;
    const left = mouse_x < max_x ? max_x + 10 : 10;
    const top = e.pageY - e.clientY + 80;
    const [from_ts, to_ts] = this.getCurrentTimeInterval();

    this.changeUrl({
      from_ts: from_ts,
      to_ts: to_ts,
      id: box_id
    });

    //this.props.history.push(`/${start_time}/${stop_time}/${box_id}`);
    this.setState({ popupLeft: left, popupTop: top });
    this.loadPopup(box_id);
  }

  loadPopup(box_id) {
    console.log(box_id);
    const url = `${this.props.api}info?id=${box_id}`;
    this.setState({ infoData: {}, infoLoading: true });
    fetch(url)
      .then(responsePromise => {
        const r = responsePromise.json();
        return r;
      })
      .then(response => {
        console.log("Data loaded");
        const data = response.result;
        console.log(data);
        this.setState({
          infoData: data,
          infoLoading: false
        });
      })
      .catch(this.errorHandler);
  }

  closePopup() {
    const [from_ts, to_ts] = this.getCurrentTimeInterval();
    this.changeUrl({ from_ts: from_ts, to_ts: to_ts, id: null });
  }

  render() {
    const width = window.innerWidth;
    const onChange = this.onChange.bind(this);
    const [start_ts, stop_ts] = this.getCurrentTimeInterval();
    const openPopup = this.openPopup.bind(this);
    const onClose = this.closePopup.bind(this);
    const isLoading = this.state.isLoading ? (
      <div className="loaderIndicator">Loading data...</div>
    ) : null;
    console.warn(this.props.popupContent);
    return (
      <div className="App">
        {isLoading}
        <ToolBar
          changeTs={onChange}
          from_ts={start_ts}
          to_ts={stop_ts}
          q={this.state.q}
          onChangeSearch={this.onChangeSearch}
          onFlushClick={this.flush}
        />
        <TimeLine
          width={width}
          start_ts={start_ts}
          stop_ts={stop_ts}
          data={this.state.data}
          onChange={onChange}
          lastUpdate={this.state.lastUpdate}
          onEventClick={openPopup}
        />
        <Popup
          isVisible={this.props.match.params.id != null}
          onClose={onClose}
          left={this.state.popupLeft}
          top={this.state.popupTop}
        >
          <this.props.popupContent data={this.state.infoData} />
        </Popup>
      </div>
    );
  }
}
