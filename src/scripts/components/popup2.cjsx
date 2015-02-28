moment = require('moment')
$ = require 'jquery'

# Props:
# - renderFunction
Popup = React.createClass
  displayName: 'Popup'
  getInitialState: () ->
        return {
                x: 0
                y: 0
                focused: false
        }
  componentDidMount: () ->
        window.addEventListener('mousemove', @updateCoords, false)
        window.addEventListener('keydown', @handleFocus, false)
  componentWillUnmount: () ->
        window.removeEventListener('mousemove', @updateCoords, false)
        window.removeEventListener('keydown', @handleFocus, false)
  updateCoords: (e) ->
        console.log(e)
        if not @state.focused and @props.visible
           screenHeight = $(window).height()
           screenWidth = $(window).width()
           x = e.x + 10
           y = e.y
           popupHeight = $(@getDOMNode()).height()
           popupWidth = $(@getDOMNode()).width()
           if screenHeight - y < popupHeight + 30
               y = screenHeight - popupHeight - 30
           if screenWidth - x < popupWidth + 30
               x = x - popupWidth - 10 - 30
           @setState({x: x , y: y})
  handleFocus: (e) ->
        if e.keyCode == 16
          focus = not @state.focused
          @setState({focused: focus, contentRenderer: @props.contentRenderer})
          if @props.onFocusEvent
            @props.onFocusEvent(focus)
          e.stopPropagation()
  #componentWillReceiveProps: ()
  shouldComponentUpdate: (newP, newS) ->
        #if @props.visible and not newP.visible
        #        console.log("transitioning to hidden state")
        return  true #@props.info.visible
  render: ->
        #console.log(@props.info.visible)
        if @state.focused
                info = @state
        else
                info = @props
        if not info or not info.contentRenderer
                return null
        styles =
                display: if info.visible or @state.focused then "block" else "none"
                left: @state.x
                top: @state.y
  
        el = info.contentRenderer(@props)

        return (
            <div className={['popup', if @state.focused then 'focused' else 'unfocused'].join(' ') } style={styles}>
                <div className='focusMsg'>{if @state.focused then "Press SHIFT to release focus" else "Press SHIFT to focus"}
                </div>
                {el}
            </div>
        )        
module.exports = Popup