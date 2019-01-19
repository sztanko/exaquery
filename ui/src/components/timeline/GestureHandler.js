import React, { Component } from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import "./GestureHandler.css";

function TimeMarker(props) {
  return (
    <line
      x1={props.x}
      y1={0}
      x2={props.x}
      y2={10000}
      className="TimeMarker"
    />
  );
}

class GestureHandler extends Component {
  state = { x: 0, zoom: 1, i: 0, mousePos: null };

  static defaultProps = {};

  static propTypes = {
    onChange: PropTypes.func
  };

  rescale(currentZoom, currentOffset, zoomFactor, newCenterPoint) {
    const zoom = currentZoom * zoomFactor;
    const realX = newCenterPoint / currentZoom + currentOffset;
    const newOffset = realX - newCenterPoint / zoom;
    return [zoom, newOffset];
  }

  onMouseMove = e => {
    const rect = ReactDOM.findDOMNode(
      this.refs["BackgroundRect"]
    ).getBoundingClientRect();
    const x = e.clientX - rect.left;
    this.setState({ mousePos: x });
  };

  _onWheel = e => {
    const absX = Math.abs(e.deltaX);
    const absY = Math.abs(e.deltaY);
    // console.log(e.ctrlKey)
    if (!e.ctrlKey && (absX < 1 || absY / absX >= 2)) {
      return;
    }
    e.preventDefault();
    if (e.ctrlKey) {
      const rect = ReactDOM.findDOMNode(
        this.refs["BackgroundRect"]
      ).getBoundingClientRect();
      const x = e.clientX - rect.left; //x position within the element.

      const zoomFactor = 1 - e.deltaY / 100;

      const [zoom, new_offset] = this.rescale(
        this.state.zoom,
        this.state.x,
        zoomFactor,
        x
      );

      this.setState({ zoom: zoom, x: new_offset, i: this.state.i + 1 });
      this.props.onChange(zoom, new_offset);
    } else {
      const new_offset = this.state.x + (4 * e.deltaX) / this.state.zoom;
      this.setState({ x: new_offset });
      this.props.onChange(this.state.zoom, new_offset);
    }
  };

  componentWillReceiveProps(newProps) {
    this.setState({ x: 0, zoom: 1 });
  }
  render() {
    const transform = `scale(${this.state.zoom}, 1) translate(${-this.state
      .x},0)`;

    return (
      <g
        className="GestureContainer"
        onWheel={this._onWheel}
        onMouseMove={this.onMouseMove}
      >
        <rect
          x="0"
          y="0"
          height="10000"
          width="10000"
          className="BackgroundRect"
          ref="BackgroundRect"
        />
        <TimeMarker x={this.state.mousePos} height="100%" />
        <g className="GestureHandler" transform={transform}>
          {this.props.children}
        </g>
        
      </g>
    );
  }
}

export default GestureHandler;
