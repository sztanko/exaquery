Channel = require './components/channel'
TimeScale = require './components/timescale'
ChannelList = require './components/channellist'

ViewPort = React.createClass
	displayName: 'ViewPort'
	getInitialState: () ->
		return {
			tr: 0
		}
	getTimeScale: () ->
		dur = (@props.max_ts - @props.min_ts)
      	hiddenSpace = @props.view.buffer
      	graphWidth = @props.view.width - @props.view.leftWidth
      	d3.scale.linear()
      		.domain([@state.min_ts - dur * hiddenSpace, @state.max_ts + dur * hiddenSpace])
      		.rangeRound([-hiddenSpace * graphWidth + @props.view.leftWidth, (hiddenSpace + 1) * graphWidth])
    componentWillMount: () ->
    	window.addEventListener('DOMMouseScroll', @onScroll, false)
    onScroll: (e) ->
    	tr = @state.tr + e.wheelDeltaX
    	@setState({tr: tr, min_ts: @props.min_ts + tr, max_ts: @props.max_ts + tr})
    	@changeProps(@)

    changeProps: _.debounce( (min_ts, max_ts) -> { @props.onChange(min_ts, max_ts)}, 200)
    componentWillReceiveProps: (np) ->
    	ns =
    		tr: 0
    		min_ts: np.min_ts
    		max_ts: np.max_ts
    	@setState(ns)
    	return
    	# These thing should come later
    	nDur = np.max_ts - np.min_ts
    	dur = @props.max_ts - @@props.min_ts
    	if nDur != dur or np.view.buffer != @props.view.buffer
    		@setState(ns)
    		return 
    	if Math.abs(np.max_ts-@props.max_ts) < dur * @props.view.buffer
    		@setState({tr: @props.max_ts - np.max_ts})
    		return
    	
	render: () ->
		timeScale = @getTimeScale
		t=@
		_(t.props.data)
			.map('channels')
        	.flatten()
        	.map (d) ->
        	<Channel key={d.index} data={d} onClick={t.onSessionClick} timeScale={timeScale} height={t.state.view.rowHeight} rowPadding={t.state.view.rowPadding} verticalOffset={t.state.view.rowHeight*d.index} showInfo={t.showInfo} hideInfo={t.hideInfo} />
        .value()

		<g className="ViewPort" transform={"translate("+@state.tr+")"}>
			<TimeScale min_ts={@props.min_ts} max_ts={@props.max_ts} />
			<g className="channels">
				{channels}
			</g>
		</g>

module.exports = React.createClass
	displayName: 'Graph'
	render: () ->
		view = @props.settings
		numChannels = _(@props.data).reduce( (count, account) -> count + account.channels.length)
        .map('channels')
        .flatten()
        .map (d, i)
		height = view.rowHeight * numChannels + view.timeScaleHeight
		<svg width={view.width} height={height}>
			<ViewPort data={@props.data} min_ts={@props.min_ts} max_ts={@props.max_ts} view={view}/>
			<ChannelList data={@props.data} width={view.leftWidth} height={height - view.timeScaleHeight} x={view.timeScaleHeight} />
		<svg>