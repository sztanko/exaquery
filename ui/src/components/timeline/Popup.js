import React, { Component } from "react";
import PropTypes from "prop-types";
import "./Popup.css";

class Popup extends Component {
  static propTypes = {
    id: PropTypes.string,
    onClose: PropTypes.func
  };

  render() {
    //console.log("Channels Render");
    const displayType = this.props.isVisible ? "block" : "none";

    const onClose = this.props.onClose;
    return (
      <div
        className="Popup"
        style={{
          display: displayType,
          left: this.props.left?this.props.left:10 + "px",
          top: this.props.top?this.props.top:30 + "px"
        }}
      >
        <div className="controls" onClick={onClose} title="Close Popup">
          X
        </div>
        <div className="content">{this.props.children}</div>
      </div>
    );
  }
}

export default Popup;
