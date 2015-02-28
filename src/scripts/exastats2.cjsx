Router = require('react-router')
moment = require('moment')
$ = require 'jquery'
d3 = require 'd3'
Channel = require './components/channel'
TimeScale = require './components/timescale'
ChannelList = require './components/channellist'
Popup = require './components/popup2'
Controls = require './components/controls'
Graph = require './components/graph'
window.jq = $
window.moment = moment
window._ = require 'lodash'
dataloader = require './dataloader'
window.process = process
window.d3 = d3

module.exports = React.createClass
  displayName: 'Exagraph'
  mixins: [Router.State, Router.Navigation]
  getDefaultProps: () ->
    view = 
        width: $(document).width()
        leftWidth: 250
        rowHeight: 12
        timeScaleHeight: 20
        rowPadding: 0.3
        channelPadding: 1.5
        buffer: 1.5 #How much view should be cached before rerendering view
    controls =
        minDuration: 20
        maxDuration: 5 * 3600 * 1000 #5 hours
    url = ""
    #max_ts = 1419438269268 
    max_ts = new Date().getTime()
    min_ts = max_ts - 3600 * 1000
    return {view: view, min_ts: min_ts, max_ts: max_ts, controls: controls, url: "http://bi1.mlan:5002/"}

  getInitialState: () ->
    return {
        popup:
            visible: false
        loaded: false
        isLoading: false
        lastUpdate: new Date().getTime()
    }

  componentWillMount: () ->
    @setState({loaded: false, channels: []})

    @db = new dataloader.DataLoader(@props.url)
    t = @
    if @props.params.fromTs and @props.params.toTs
        t.zoomTo(@props.params.fromTs, @props.params.toTs, true)
    else
        t.zoomTo(@props.min_ts, @props.max_ts, true)
    #@db.getData(@props.min_ts, @props.max_ts, @props.view.buffer, (channels) ->
    #    window.data = channels
    #    t.setState({loaded: true, channels: channels, min_ts: t.props.min_ts, max_ts: t.props.max_ts})
    #    return
    #)
  componentWillReceiveProps: (np) ->
      console.log("Receiving new props")
      #console.log(newProps)
      @zoomTo(+np.params.fromTs, +np.params.toTs, true)
      return true

  showInfo: (renderer, event) ->
        console.log("rendering info")
        popup = {
           contentRenderer: renderer
           event: event
           visible: true
           focused: false
        }
        #console.log(event)
        @setState({popup: popup})
  hideInfo: () ->
        popup = @state.popup
        #console.log("Hiding popup")
        popup.visible = false
        @setState({popup: popup})
  zoomTo: (from, to, doNotChangeUrl) ->
    console.log("Zooming from "+from+" to "+to)
    duration = to - from
    duration = Math.min(@props.controls.maxDuration, Math.max(duration, @props.controls.minDuration))
    from = to - duration
    from = Math.round(from)
    to = Math.round(to)
    @setState({min_ts: from, max_ts: to})
    t = @
    @db.getData(from, to, @props.view.buffer, (channels, isLoading) ->
        window.data = channels
        #t.zoomTo(min_ts, max_ts)
        popup = t.state.popup
        popup.visible = false
        popup.focused = false
        #console.log("Received new data")
        lastUpdate = new Date().getTime()
        t.setState({loaded: true, isLoading: isLoading, channels: channels, popup: popup, lastUpdate: lastUpdate})
        if not doNotChangeUrl
            t.transitionTo('graph', {fromTs: from, toTs: to})
        return
    )
  onPopupFocusChange: (focus) ->
    console.log("Changing focus to "+focus)
    popup = @state.popup
    popup.focused = focus
    @setState({popup: popup})

  render: ->
    if not @state.loaded
          return (<div className="exagraph loading">
              <h1>Loading data</h1>
          </div>)
          
    return (
        <div className='exagraph'>
            <Popup visible={@state.popup.visible} contentRenderer={@state.popup.contentRenderer} event={@state.popup.event} onFocusEvent={@onPopupFocusChange}/>
            <Controls min_ts={@state.min_ts} max_ts={@state.max_ts} settings={@props.controls} onChange={@zoomTo} isLoading={@state.isLoading} />
            <Graph data={@state.channels} settings={@props.view} showInfo={@showInfo} hideInfo={@hideInfo} onChange={@zoomTo} min_ts={@state.min_ts} max_ts={@state.max_ts} lastUpdate={@state.lastUpdate} freeze={@state.popup.focused}/>
        </div>
    )