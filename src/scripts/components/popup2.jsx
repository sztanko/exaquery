import React from 'react';
import moment from 'moment';
import $ from 'jquery';

// Props:
// - renderFunction
const Popup = React.createClass({
  displayName: 'Popup',
  getInitialState() {
    return {
      x: 0,
      y: 0,
      focused: false
    };
  },
  componentDidMount() {
    window.addEventListener('mousemove', this.updateCoords, false);
    return window.addEventListener('keydown', this.handleFocus, false);
  },
  componentWillUnmount() {
    window.removeEventListener('mousemove', this.updateCoords, false);
    return window.removeEventListener('keydown', this.handleFocus, false);
  },
  updateCoords(e) {
    console.log(e);
    if (!this.state.focused && this.props.visible) {
      const screenHeight = $(window).height();
      const screenWidth = $(window).width();
      let x = e.x + 10;
      let { y } = e;
      const popupHeight = $(this.getDOMNode()).height();
      const popupWidth = $(this.getDOMNode()).width();
      if (screenHeight - y < popupHeight + 30) {
        y = screenHeight - popupHeight - 30;
      }
      if (screenWidth - x < popupWidth + 30) {
        x = x - popupWidth - 10 - 30;
      }
      return this.setState({ x, y });
    }
  },
  handleFocus(e) {
    if (e.keyCode === 16) {
      const focus = !this.state.focused;
      this.setState({
        focused: focus,
        contentRenderer: this.props.contentRenderer
      });
      if (this.props.onFocusEvent) {
        this.props.onFocusEvent(focus);
      }
      return e.stopPropagation();
    }
  },
  //componentWillReceiveProps: ()
  shouldComponentUpdate(newP, newS) {
    //if @props.visible and not newP.visible
    //        console.log("transitioning to hidden state")
    return true;
  }, //@props.info.visible
  render() {
    //console.log(@props.info.visible)
    let info;
    if (this.state.focused) {
      info = this.state;
    } else {
      info = this.props;
    }
    if (!info || !info.contentRenderer) {
      return null;
    }
    const styles = {
      display: info.visible || this.state.focused ? 'block' : 'none',
      left: this.state.x,
      top: this.state.y
    };

    const el = info.contentRenderer(this.props);

    return (
      <div
        className={['popup', this.state.focused ? 'focused' : 'unfocused'].join(
          ' '
        )}
        style={styles}
      >
        <div className="focusMsg">
          {this.state.focused
            ? 'Press SHIFT to release focus'
            : 'Press SHIFT to focus'}
        </div>
        {el}
      </div>
    );
  }
});
export default Popup;
