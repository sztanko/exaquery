import React from 'react';

import QueryPopup from './querypopup';
import d3 from 'd3';

const Query = React.createClass({
  displayName: 'Query',
  //scale: d3.scale.category20().domain(["COMMIT", "SELECT", "OPEN SCHEMA", "ROLLBACK", "TRUNCATE TABLE", "INSERT", "DELETE", "ALTER SESSION", "FLUSH STATISTICS", "DROP TABLE", "IMPORT", "CREATE TABLE", "NOT SPECIFIED", "GRANT OBJECT", "DESCRIBE", "DROP VIEW", "CREATE VIEW", "EXPORT", "MERGE", "NO OP", "UPDATE"])
  onMouseOver(e) {
    //console.log("mouseover query")
    if (this.props.showInfo) {
      return this.props.showInfo(this.renderInfo, e);
    }
  },
  renderInfo(popupProps) {
    return <QueryPopup {...Object.assign({}, this.props)} />;
  },
  render() {
    const { props } = this;
    const tScale = props.timeScale;
    const start_time = Math.max(tScale.domain()[0], props.data.start_time);
    const stop_time = Math.min(tScale.domain()[1], props.data.stop_time);

    const x = tScale(start_time);
    let width = tScale(stop_time) - x;
    if (width < 0.5) {
      width = 0.5;
    }
    const isSuccess = props.data.success ? 'success' : 'fail';
    const classStrings = _([
      'query',
      props.data.command_class,
      isSuccess,
      props.data.command_name
    ])
      .map(d => d.replace(' ', '_'))
      .value()
      .join(' ');
    const id = props.data.session_id + '_' + props.data.stmt_id;
    const y = props.height * props.rowPadding;
    const height = props.height * (1 - 2 * props.rowPadding);
    //style =
    //    fill: @scale(@props.data.command_class)
    return (
      <rect
        className={classStrings}
        x={x}
        id={id}
        width={width}
        y={y}
        height={height}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.props.hideInfo}
      />
    );
  }
});

export default Query;
