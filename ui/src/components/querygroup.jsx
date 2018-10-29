import React from 'react';

import QueryPopup from './querypopup';
import d3 from 'd3';

const QueryGroup = React.createClass({
  displayName: 'QueryGroup',
  onMouseOver(e) {
    //console.log("mouseover query")
    if (this.props.showInfo) {
      return this.props.showInfo(this.renderInfo, e);
    }
  },
  renderInfo(popupProps) {
    const { props } = this;
    const queries = _(this.props.data)
      .sortBy('stmt_id')
      .map(d => (
        <QueryPopup
          {...Object.assign({}, props, { data: d, simplifiedView: true })}
        />
      ));
    const id = _(this.props.data)
      .map('session_id')
      .first();
    return (
      <div className="querygroup">
        <h3>
          Session {id}, {this.props.data.length} statements
        </h3>
        {queries}
      </div>
    );
  },
  render() {
    const { props } = this;
    const tScale = props.timeScale;

    const isSuccess = _(props.data)
      .map('success')
      .all()
      ? 'success'
      : 'fail';
    const classStrings = _(['querygroup', isSuccess])
      .map(d => d.replace(' ', '_'))
      .value()
      .join(' ');
    const id = _(props.data)
      .map('session_id')
      .first();
    return (
      <rect
        className={classStrings}
        x={this.props.x}
        id={id}
        width={this.props.width}
        y={this.props.y}
        height={this.props.height}
        onMouseOver={this.onMouseOver}
        onMouseOut={this.props.hideInfo}
      />
    );
  }
});

export default QueryGroup;
