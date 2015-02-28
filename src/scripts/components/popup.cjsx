moment = require('moment')
$ = require 'jquery'

Popup = React.createClass
  displayName: 'Popup'
  getInitialState: () ->
        return {
                x: 0,
                y: 0,
                focused: false
        }
  componentDidMount: () ->
        window.addEventListener('mousemove', @updateCoords, false)
        window.addEventListener('keydown', @handleFocus, false)
  componentWillUnmount: () ->
        window.removeEventListener('mousemove', @updateCoords, false)
        window.removeEventListener('keydown', @handleFocus, false)
  updateCoords: (e) ->
        #console.log(e)
        if not @state.focused and @props.info.visible
           screenHeight = $(window).height()
           screenWidth = $(window).width()
           x = e.x + 10
           y = e.y
           popupHeight = $(@getDOMNode()).height()
           #console.log("popup height is "+popupHeight)
           popupWidth = $(@getDOMNode()).width()
           if screenHeight - y < popupHeight + 30
               y = screenHeight - popupHeight - 30
           if screenWidth - x < popupWidth + 30
               x = x - popupWidth - 10 - 30
           @setState({x: x , y: y})
  handleFocus: (e) ->
        #console.log("Key pressed")
        #console.log(e)
        if e.keyCode == 16
           focus = not @state.focused
           info = @props.info
           if not focus
               info = {}
           @setState({focused: focus, info: info})
           @props.enableScrolling(not focus)
           e.stopPropagation()
  zoomToSession: ()->
      end_time = if @state.info.data.session.logout_time then @state.info.data.session.logout_time*1000 else @state.info.data.stop_time
      @props.zoomTo(@state.info.data.session.login_time * 1000, end_time, true)
  zoomToStmt: ()->
      @props.zoomTo(@state.info.data.start_time, @state.info.data.stop_time, true)
  shouldComponentUpdate: (newP, newS) ->
        if @props.info.visible and not newP.info.visible
                console.log("transitioning to hidden state")
        #console.log(newP.info.visible + ", previously " + @props.info.visible)
        return  true #@props.info.visible
  render: ->
        #§console.log(@props.info.visible)
        if @state.focused
                info = @state.info
        else
                info = @props.info
        if not info or not info.data
                return null
        tf = d3.time.format('%Y-%m-%d %H:%M:%S.%L')
        styles =
                display: if info.visible or @state.focused then "block" else "none"
                left: @state.x
                top: @state.y
        sql_text = "text"
        error = null

        dur = info.data.stop_time-info.data.start_time
        if dur<60000
            durStr = d3.format("0,000")(dur) + " ms"
        else
            durStr = moment.duration(dur).humanize()
        
        if info and info.data and info.data.sql_text
                sql_text = info.data.sql_text
                if info.data.error_code
                   error = <code className='errorMsg'>{info.data.error_code}: {info.data.error_text}</code>
        owners = null
        if info.data.session
            owners = (<div className='owners'>{info.data.session.user_name} from {info.data.session.os_user}@{info.data.session.host} ({info.data.session.client}, {info.data.session.os_name})</div>)

        return <div className={['popup', if @state.focused then 'focused' else 'unfocused'].join(' ') } style={styles}>
                <div className='focusMsg'>{if @state.focused then "Press SHIFT to release focus" else "Press SHIFT to focus"}</div>
                <div className="sessionId"><a href='javascript:void()' onClick={@zoomToSession}>{info.data.session_id}</a>, statement <a href='javascript:void()' onClick={@zoomToStmt}>{info.data.stmt_id}</a></div>
                <div className="queryInfo">Class: <code className={info.data.command_class}>{info.data.command_class}: {info.data.command_name}</code></div>
                {owners}
                <div className='timeInfo'>Started: <code>{tf(new Date(info.data.start_time))}</code>, <br/>Ended: <code>{tf(new Date(info.data.stop_time))}</code>, <br/>Duration: <code>{durStr}</code></div>

                {error}
                <code className='sql'>{sql_text}</code></div>

module.exports = Popup