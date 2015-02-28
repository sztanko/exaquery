Router = require('react-router')
moment = require('moment')
$ = require 'jquery'
d3 = require 'd3'
Channel = require './components/channel'
TimeScale = require './components/timescale'
ChannelList = require './components/channellist'
Popup = require './components/popup'
Controls = require './components/controls'
window.$ = $
window.moment = moment
window._ = require 'lodash'
process = require('./dataloader').process
window.process = process
window.d3 = d3


Controls2 = React.createClass
    displayName: "Controls"
    timeFormat: d3.time.format('%Y-%m-%d %H:%M:%S.%L')
    numberFormat: d3.format("0,000")
    tickValues: [20, 75, 250, 1000, 4000, 15000, 30000, 60000, 180000, 300000, 900000, 1800000, 3600000, 7200000, 3600000 * 3, 3600000 * 4, 3600000 * 5]
    getInitialState: () ->
        return {
            start_ts_f: @timeFormat(new Date(+@props.startTs))
            dur: Math.round(+@props.duration)
        }
    componentWillReceiveProps: (np)->
        @setState({start_ts_f: @timeFormat(new Date(np.startTs)), dur: +np.duration})
        true
    getRangeScale: () ->
         a = d3.scale.ordinal().domain([1..@tickValues.length]).range(@tickValues)
         a.invert = d3.scale.ordinal().range([1..@tickValues.length]).domain(@tickValues)
         a
         #d3.scale.pow().domain([1,20]).rangeRound([+@props.minRange,+@props.maxRange]).exponent(6)
     
    formatDur: (d) ->
        if d<1000
            return @numberFormat(d)+" ms"
        if d<180000
            return @numberFormat(Math.round(d/1000))+" seconds"
        else
            return moment.duration(d).humanize()
    handleChange: (t) ->
        if t.target.name=='dur'
            @setState({dur: @getRangeScale()(t.target.value)})
        else
            a = {}
            a[t.target.name] = t.target.value
            @setState(a)
        #console.log(t.target.value)
        _submitChanges()
    submitChanges: () ->
        if from_date = @timeFormat.parse(@state.start_ts_f)
            from_ts = from_ts.getTime()
            to_ts = @state.dur + from_ts
            @props.onChange(from_ts, to_ts)
    
    #_submitChanges: _.debounce(@submitChanges, 300)
    render: ->
        scale = @getRangeScale()
        #return null
        return <div className="controls">
        <input type='text' value={@state.start_ts_f} name='start_ts_f' onChange={@handleChange}/>
        <input type='range' min='1' max={@tickValues.length} value={scale.invert(@state.dur)} name='dur' onChange={@handleChange}/>{@formatDur @state.dur}</div>
module.exports = React.createClass
  displayName: 'Exagraph'
  mixins: [Router.State, Router.Navigation]
  groupSessions: (d, session) ->
        if session
            return [session.user_name, session.os_user].join(' ')
        else
            return '_unkown session'
  
  componentWillMount: () ->
    @setState({loaded: false, channels: []})
    t = @
    $.getJSON('/out.json', (d) ->
        console.log("Received data")
        console.log(t.props)
        window.rawData = d
        grouped_channels = process(d, t.groupSessions)
        window.data = grouped_channels
        #min_ts = _(grouped_channels).map('start_time').min().value()
        if t.props.params and t.props.params.fromTs
            max_ts = +t.props.params.toTs
            min_ts = +t.props.params.fromTs
        else
            max_ts = _(grouped_channels).map('end_time').max().value()
            min_ts = d3.time.hour.offset(new Date(max_ts), -3).getTime()
        view = {}
        view.leftWidth=250
        view.totalWidth=1200
        view.rowHeight=8
        view.timeScaleHeight=20
        view.numChannels = _(grouped_channels).reduce( ((sum, ch) -> sum + ch.channels.length), 0)
        view.totalHeight = view.timeScaleHeight + view.rowHeight*view.numChannels
        view.rowPadding = 0.1
        view.graphWidth = view.totalWidth - view.leftWidth
        view.shouldScroll = true
        popup = {}
        t.zoomTo(min_ts, max_ts)
        t.setState({loaded: true, data: d, grouped_channels: grouped_channels, view: view, popup: popup})
        return
    )
  componentWillReceiveProps: (np) ->
      console.log("Receiving new props")
      #console.log(newProps)
      @zoomTo(+np.params.fromTs, +np.params.toTs)
  showInfo: (query, event) ->
        popup = {
           data: query,
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
  getTimeScale: ->
      dur = (@state.max_ts - @state.min_ts)
      hiddenSpace = 1
      d3.scale.linear().domain([@state.min_ts - dur * hiddenSpace, @state.max_ts + dur * hiddenSpace]).rangeRound([-hiddenSpace * (@state.view.graphWidth) + @state.view.leftWidth, (hiddenSpace + 1) * @state.view.graphWidth])
  componentDidMount: ->
      window.addEventListener('DOMMouseScroll', @onScroll, false)
      window.onmousewheel = @onScroll
      @redrawOnScroll = _.debounce(@_redrawOnScroll, 300)
  componentWillUnmount: ->
      window.removeEventListener('DOMMouseScroll', @onScroll, false)
  onScroll: (e) ->
    #console.log(e)
    if @state.view.shouldScroll
        tr = e.wheelDeltaX
        vTr = e.wheelDeltaY
        @setState({tr: @state.tr + tr, vTr: @state.vTr + vTr})
        @redrawOnScroll(e.clientX)
        #e.stopPropagation()
        return false
    else
        return true
  showSystemMessage: (msg) ->
    return $('#popup').offset({top:200, left: 200}).html("<div class='system'>"+msg+"</div>").show()
  componentWillUpdate: () ->
    #console.log("About to start rendering")
    #s = @showSystemMessage("Refreshing data")
  
  _redrawOnScroll: (xPos) ->
    #s = @showSystemMessage("Refreshing data")
    if Math.abs(@state.tr) < @state.view.totalWidth/1.3
        return true
    timeScale = @getTimeScale()
    #console.log(xPos)
    tInvert = timeScale.invert
    xOffset = tInvert(0) - tInvert(@state.tr)
    maxTs = @state.max_ts
    minTs = @state.min_ts
    #duration = maxTs-minTs
    #dur = duration/1000
    #if dur<12000 and dur>0.5 and (@state.vTr>10 or @state.vTr<-10)
    #    ch = 0 #- duration*@state.vTr/800
    #    #console.log("changing time window by "+ch/1000)
    #else
    #    ch = 0
    @zoomTo(minTs + xOffset, maxTs + xOffset)
    #s.hide()
    #@setState({max_ts: maxTs + xOffset + ch, min_ts: minTs + xOffset - ch, tr: 0, vTr: 0})
    true
  zoomTo: (from, to, withMargin) ->
    duration = to - from
    if duration > 3600*1000*5
        from = to - 3600*1000*5
    if duration < 10
        from = to - 10
    if withMargin
        margin = (to - from) / 5
        to = to + margin
        from = from - margin
    from = Math.round(from)
    to = Math.round(to)
    @setState({max_ts: to, min_ts: from, tr: 0, vTr: 0})
    console.log("Changing path")
    this.transitionTo('graph', {fromTs: +from, toTs: +to})
    console.log("After changing path")
  onSessionClick: (data, e) ->
    @zoomTo(data.start_time, data.end_time)
  render: ->
    if not @state.loaded
          return (<div className="graph">
              <h1>Loading data</h1>
          </div>)
          
    t = @
    timeScale = @getTimeScale()
    control = (<Controls minRange={20} maxRange={3600000*5} startTs={@state.min_ts} duration={@state.max_ts - @state.min_ts} onChange={@zoomTo}/>)
    channels = _(t.state.grouped_channels)
        .map('channels')
        .flatten()
        .map (d, i) ->
            <Channel key={i} data={d} onClick={t.onSessionClick} timeScale={timeScale} height={t.state.view.rowHeight} rowPadding={t.state.view.rowPadding} verticalOffset={t.state.view.rowHeight*d.index} showInfo={t.showInfo} hideInfo={t.hideInfo} />
        .value()
    <div className='ui'>
    {control}
    <Popup id='popup' info={@state.popup} zoomTo={@zoomTo} enableScrolling={(b) -> t.state.view.shouldScroll = b}/>
    <svg className="graph" id='graph' width={t.state.view.totalWidth} height={t.state.view.totalHeight}>
            <g className="dragable" id='dragable' transform={"translate("+@state.tr+",0)"}>
                <TimeScale timeScale={timeScale} timeScaleHeight={t.state.view.timeScaleHeight} height={t.state.view.totalHeight} />
                <g className="channels" transform={"translate(0,"+t.state.view.timeScaleHeight+")"}>
                    {channels}
                </g>
            </g>
            <ChannelList data={t.state.grouped_channels} height={t.state.view.rowHeight} rowPadding={t.state.view.rowPadding} transform={"translate(0,"+t.state.view.timeScaleHeight+")"} width={t.state.view.leftWidth}/>
    </svg></div>
