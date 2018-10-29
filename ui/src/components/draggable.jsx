import React from 'react';

const Draggable = React.createClass({
  displayName: 'Draggable',
  getDefaultProps() {
    return { freeze: false };
  },
  getInitialState() {
    return {
      tr: 0,
      isDrag: false
    };
  },
  onScroll(e) {
    if (!this.props.freeze) {
      this.pan(e.wheelDeltaX);
      e.stopPropagation();
      e.preventDefault();
      return true;
    }
    return true;
  },
  onMouseDown(e) {
    //console.log(e)
    //console.log(e.path)
    if (
      true ||
      _(e.path)
        .map('nodeName')
        .contains('svg')
    ) {
      //console.log("mousedown")
      //console.log(e)
      //console.log("yay")
      this.setState({ isDrag: true, xPos: e.clientX });
      e.preventDefault();
    }
    return true;
  },
  onMouseMove(e) {
    if (this.state.isDrag) {
      //console.log(e)
      this.pan(e.clientX - this.state.xPos, true);
      e.preventDefault();
      e.stopPropagation();
      return true;
    }
    return true;
  },
  onMouseUp(e) {
    //console.log("mouseup")
    this.setState({ isDrag: false });
    this.changeProps();
    return true;
  },
  pan(amount, absoluteTransition) {
    if (!absoluteTransition) {
      this.setState({ tr: this.state.tr + amount }); //, min_ts: min_ts, max_ts: max_ts})
    } else {
      this.setState({ tr: amount });
    }
    this.changeProps();
    return true;
  },
  _changeProps() {
    const { tr } = this.state;
    this.setState({ tr: 0 });
    this.props.onChange(tr);
    return true;
  },
  componentWillMount() {
    //window.addEventListener('DOMMouseScroll', @onScroll, false)
    window.addEventListener('mouseup', this.onMouseUp);
    //window.addEventListener('mousedown', @onMouseDown)
    window.addEventListener('mousemove', this.onMouseMove);
    const t = this;
    return (this.changeProps = _.debounce(this._changeProps, 300));
  },
  //window.onmousewheel = @onScroll
  //window.addEventListener('DOMMouseScroll', @onScroll, false)

  componentWillUnmount() {},
  //window.removeEventListener('DOMMouseScroll', @onScroll, false)
  //window.removeEventListener('mouseup', @onMouseUp, false)
  //window.removeEventListener('mousedown', @onMouseDown, false)
  //window.removeEventListener('mousemove', @onMouseMove, false)

  render() {
    const r = this.props.timeScale.range();
    const style = { fill: 'white', cursor: '-webkit-grab', stroke: 'none' };
    //onMouseDown={@onMouseDown} onMouseUp={@onMouseUp} onMouseMove={@onMouseMove}
    return (
      <g>
        <rect
          style={style}
          y={0}
          x={r[0]}
          height={this.props.height}
          width={r[1] - r[0]}
          onMouseDown={this.onMouseDown}
        />
        <g className="draggable" transform={`translate(${this.state.tr},0)`}>
          {this.props.children}
        </g>
      </g>
    );
  }
});

export default Draggable;
