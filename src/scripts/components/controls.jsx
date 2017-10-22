import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import d3 from 'd3';

const Controls = React.createClass({
  displayName: 'Controls',
  numberFormat: d3.format('0,000'),
  tickValues: [
    20,
    75,
    250,
    1000,
    4000,
    15000,
    30000,
    60000,
    180000,
    300000,
    900000,
    1800000,
    3600000,
    7200000,
    3600000 * 3,
    3600000 * 4,
    3600000 * 5
  ],
  getInitialState() {
    const timeFormat = d3.time.format('%Y-%m-%d %H:%M:%S.%L');
    this.timeFormat = timeFormat;
    this._submitChanges = _.debounce(this.submitChanges, 300);
    const dur = Math.round(this.props.max_ts - this.props.min_ts);
    return {
      start_ts_f: timeFormat(new Date(+this.props.min_ts)),
      dur: Math.round(dur)
    };
  },
  componentWillReceiveProps(np) {
    const dur = Math.round(np.max_ts - np.min_ts);
    this.setState({ start_ts_f: this.timeFormat(new Date(+np.min_ts)), dur });
    return true;
  },
  getRangeScale() {
    const a = d3.scale
      .ordinal()
      .domain(__range__(1, this.tickValues.length, true))
      .range(this.tickValues);
    a.invert = d3.scale
      .ordinal()
      .range(__range__(1, this.tickValues.length, true))
      .domain(this.tickValues);
    return a;
  },
  //d3.scale.pow().domain([1,20]).rangeRound([+@props.minRange,+@props.maxRange]).exponent(6)

  formatDur(d) {
    if (d < 1000) {
      return this.numberFormat(d) + ' ms';
    }
    if (d < 180000) {
      return this.numberFormat(Math.round(d / 1000)) + ' seconds';
    } else {
      return moment.duration(d).humanize();
    }
  },
  handleChange(t) {
    if (t.target.name === 'dur') {
      this.setState({ dur: this.getRangeScale()(t.target.value) });
    } else {
      const a = {};
      a[t.target.name] = t.target.value;
      this.setState(a);
    }
    //console.log(t.target.value)
    return this._submitChanges();
  },
  submitChanges() {
    let from_date;
    if ((from_date = this.timeFormat.parse(this.state.start_ts_f))) {
      const from_ts = from_date.getTime();
      const to_ts = this.state.dur + from_ts;
      return this.props.onChange(from_ts, to_ts);
    }
  },
  render() {
    const scale = this.getRangeScale();
    let isLoading = null;
    if (this.props.isLoading) {
      isLoading = <div className="loading">fetching data from server</div>;
    }
    //return null
    return (
      <div className="controls">
        {`\
Start: `}
        <input
          type="text"
          value={this.state.start_ts_f}
          name="start_ts_f"
          onChange={this.handleChange}
        />
        {`\
Window range: `}
        <input
          type="range"
          min="1"
          max={this.tickValues.length}
          value={scale.invert(this.state.dur)}
          name="dur"
          onChange={this.handleChange}
        />
        {this.formatDur(this.state.dur)}
        {isLoading}
      </div>
    );
  }
});

export default Controls;
function __range__(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}
