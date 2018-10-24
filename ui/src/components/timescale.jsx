import React from 'react';

const TimeScale = React.createClass({
  dispalyName: 'TimeScale',
  componentDidMount() {
    return this.d3_render();
  },
  componentDidUpdate(prevProps, prevState) {
    const oldD = prevProps.timeScale.domain();
    const d = this.props.timeScale.domain();
    if (oldD[0] !== d[0] || oldD[1] !== d[1]) {
      return this.d3_render();
    }
  },
  getTimeFormat() {
    //r = _(@props.timeScale.range()).map((x) -> x.getTime()).value()
    //r = (r[1]-r[0])/1000
    //if r>3600
    //    return d3.time.format('%H:%M')
    //return d3.time.format('%H:%M:%S.%L')
    //return d3.time.format('%H:%M')
    let customTimeFormat;
    return (customTimeFormat = d3.time.format.multi([
      ['.%L', d => d.getMilliseconds()],
      [':%S', d => d.getSeconds()],
      ['%I:%M', d => d.getMinutes()],
      ['%I %p', d => d.getHours()],
      ['%a %d', d => d.getDay() && d.getDate() !== 1],
      ['%b %d', d => d.getDate() !== 1],
      ['%B', d => d.getMonth()],
      ['%Y', () => true]
    ]));
  },
  d3_render() {
    console.log('rerendering timescale');
    const timeDomain = _(this.props.timeScale.domain())
      .map(d => new Date(d))
      .value();
    const scale = d3.time
      .scale()
      .range(this.props.timeScale.range())
      .domain(timeDomain);
    const f = this.getTimeFormat();
    const axis = d3.svg
      .axis()
      .scale(scale)
      .tickSize(-this.props.tickHeight)
      //.tickSubdivide(true)
      .orient('top')
      .ticks(60);
    //.ticks(d3.time.minute, 5)
    //.tickFormat(d3.time.format.multi)
    return d3.select(this.getDOMNode()).call(axis);
  },
  //s3.select(this.getDOMNode).selectAll("line").data(scale.ticks(64), (d) -> d)
  //.enter()
  //.append("line")
  //.attr("class")
  //scale.ticks(d3.time.minute, 15)
  render() {
    return (
      <g
        transform={`translate(0,${this.props.height})`}
        className="timeScale"
      />
    );
  }
});

export default TimeScale;
