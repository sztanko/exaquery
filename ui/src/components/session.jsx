import React from 'react';
import Query from './query';
import QueryGroup from './querygroup';
const Session = React.createClass({
  displayName: 'Session',
  clickHandler(e) {
    return this.props.zoomTo(
      this.props.data.start_time,
      this.props.data.end_time
    );
  },
  render() {
    let queries;
    const { props } = this;
    const tScale = this.props.timeScale;
    const domain = this.props.timeScale.domain();
    const start_time = Math.max(tScale.domain()[0], this.props.data.start_time);
    const end_time = Math.min(tScale.domain()[1], this.props.data.end_time);
    const x = tScale(start_time);
    const width = tScale(end_time) - x + 1;
    const y = this.props.height * this.props.rowPadding;
    const height = this.props.height * (1 - 2 * this.props.rowPadding);

    if (width < 15) {
      queries = (
        <QueryGroup
          data={this.props.data.q}
          timeScale={props.timeScale}
          rowPadding={props.rowPadding}
          x={x}
          y={y}
          height={height}
          width={width}
          zoomTo={props.zoomTo}
          showInfo={props.showInfo}
          hideInfo={props.hideInfo}
        />
      );
    } else {
      queries = _(this.props.data.q)
        .filter(
          q =>
            q.start_time < domain[1] &&
            q.stop_time > domain[0] &&
            tScale(q.stop_time) - tScale(q.start_time) >= 0
        )
        .map(function(q) {
          const key = q.sessiosn_id + '_' + q.stmt_id;
          return (
            <Query
              key={key}
              data={q}
              timeScale={props.timeScale}
              rowPadding={props.rowPadding}
              height={props.height}
              zoomTo={props.zoomTo}
              showInfo={props.showInfo}
              hideInfo={props.hideInfo}
            />
          );
        })
        .value();
    }
    return (
      <g onClick={this.clickHandler}>
        <rect className="session" x={x} y={y} width={width} height={height} />
        {queries}
      </g>
    );
  }
});

export default Session;
