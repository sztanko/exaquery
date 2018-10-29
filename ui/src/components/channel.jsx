import React from 'react';

import Session from './session';

const Channel = React.createClass({
  displayName: 'Channel',
  shouldComponentUpdate(np, nS) {
    const oldD = this.props.timeScale.domain();
    const newD = np.timeScale.domain();
    if (
      newD[0] === oldD[0] &&
      newD[1] === oldD[1] &&
      np.lastUpdate === this.props.lastUpdate
    ) {
      //console.log("Channel will not update")
      return false;
    }
    //console.log("Channel will update")
    return true;
  },
  render() {
    const { props } = this;
    const domain = props.timeScale.domain();
    const range = props.timeScale.range();
    const sessions = _(this.props.data.sessions)
      .filter(
        session =>
          session.start_time < domain[1] && session.end_time > domain[0]
      )
      .map(session => (
        <Session
          onClick={props.onClick}
          key={session.session_id}
          data={session}
          timeScale={props.timeScale}
          height={props.height}
          rowPadding={props.rowPadding}
          zoomTo={props.zoomTo}
          showInfo={props.showInfo}
          hideInfo={props.hideInfo}
        />
      ))
      .value();
    const transform = `translate(0, ${props.verticalOffset})`;
    return (
      <g className="channel" transform={transform}>
        <line y1={0} y2={0} x1={range[0]} x2={range[1]} />
        <g className="sessions">{sessions}</g>
      </g>
    );
  }
});
export default Channel;
