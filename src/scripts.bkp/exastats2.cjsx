Router = require('react-router')
moment = require('moment')
$ = require 'jquery'
d3 = require 'd3'
Channel = require './components/channel'
TimeScale = require './components/timescale'
ChannelList = require './components/channellist'
Popup = require './components/popup2'
Controls = require './components/controls'
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
        width: 1200
        leftWidth: 250
        rowHeight: 8
        timeScaleHeight: 20
        rowPadding: 0.1
        buffer: 2.5 #How much view should be cached before rerendering view
    controls =
        minDuration: 20
        maxDuration: 5 * 3600 * 1000 #5 hours
    url = ""
    return {view: view, min_ts: new Date().getTime() - 3600000, max_ts: new Date().getTime(), url: "/out2.json"}
  getInitialState: () ->
    return
        popup:
            visible: false
        loaded: false

  componentWillMount: () ->
    @setState({loaded: false, channels: []})
    @db = new DataLoader(@props.url)
    t = @
    t.zoomTo(min_ts, max_ts)
    @props.db.getChannels(@props.min_ts, @props.max_ts, (channels) ->
        window.data = channels
        #t.setState({loaded: true, data: d, channels: channels, view: view, popup: popup})
        return
    )
  componentWillReceiveProps: (np) ->
      console.log("Receiving new props")
      #console.log(newProps)
      @zoomTo(+np.params.fromTs, +np.params.toTs)

  showInfo: (event, renderer) ->
        popup = {
           contentRenderer: renderer
           event: event
           visible: true
        }
        #console.log(event)
        @setState({popup: popup})
  hideInfo: () ->
        popup = @state.popup
        #console.log("Hiding popup")
        popup.visible = false
        @setState({popup: popup})
  zoomTo: (from, to) ->
    duration = to - from
    duration = Math.min(@props.maxDuration, Math.max(duration, @props.minDuration))
    from = to - duration
    from = Math.round(from)
    to = Math.round(to)
    #t.setState({loaded: false})
    @props.db.getChannels(from, to, @props.view.buffer, (channels) ->
        window.data = channels
        #t.zoomTo(min_ts, max_ts)
        t.setState({loaded: true, channels: channels, min_ts: from, toTs: to})
        this.transitionTo('graph', {fromTs: from, toTs: to})
        return
    )

  render: ->
    if not @state.loaded
          return (<div className="exagraph loading">
              <h1>Loading data</h1>
          </div>)
          
    return (
        <div className='exagraph'>
            <Popup visible={@state.popup.visible} contentRenderer={@state.popup.contentRenderer} event={@state.popup.event} />
            <Controls min_ts={@state.min_ts} max_ts={@state.max_ts} settings={@props.controls} onChange={@zoomTo}/>
            <Graph data={@state.grouped_channels} settings={@props.view} onShowPopup={@showInfo} onHidePopup={@hideInfo} onChange={@zoomTo} min_ts={@state.min_ts} max_ts={@state.max_ts}/>
        </div>
    )