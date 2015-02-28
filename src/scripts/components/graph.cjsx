Channel = require './channel'
TimeScale = require './timescale'
ChannelList = require './channellist'
_ = require 'lodash'
d3 = require 'd3'
Draggable = require './draggable'
ViewPort = React.createClass
    displayName: 'ViewPort'
    shouldComponentUpdate: (np, ns) ->
        nd = np.timeScale.domain()
        d = @props.timeScale.domain()
        if nd[0] == d[0] and nd[1] == d[1] and np.lastUpdate==@props.lastUpdate
            return false
        return true
    render: () ->
        timeScale = @props.timeScale
        t=@
        channels = _(@props.data)
            .map('channels')
            .map (d, i) ->
                _(d).map (dd) ->
                    dd.group = i
                    dd
                .value()
            .flatten()
            .map (d) ->
                <Channel key={d.index} data={d} onClick={t.onSessionClick} timeScale={t.props.timeScale} height={t.props.view.rowHeight} rowPadding={t.props.view.rowPadding} verticalOffset={t.props.view.rowHeight*d.index + (d.group + 0.5 ) * (t.props.view.channelPadding*t.props.view.rowHeight) } showInfo={t.props.showInfo} hideInfo={t.props.hideInfo} zoomTo={t.props.onChange} lastUpdate={t.props.lastUpdate}/>
        .value()
        tickHeight = (channels.length + @props.data.length * @props.view.channelPadding) * @props.view.rowHeight
        <g className="ViewPort" >
            <TimeScale timeScale={timeScale} tickHeight={tickHeight} height={@props.view.timeScaleHeight} />
            <g className="channels" transform={"translate(0,"+@props.view.timeScaleHeight+")"}>
                {channels}
            </g>
        </g>

module.exports = React.createClass
    displayName: 'Graph'
    getTimeScale: () ->
        dur = (@props.max_ts - @props.min_ts)
        hiddenSpace = @props.settings.buffer
        graphWidth = @props.settings.width - @props.settings.leftWidth
        d3.scale.linear()
            .domain([@props.min_ts - dur * hiddenSpace, @props.max_ts + dur * hiddenSpace])
            .rangeRound([-hiddenSpace * graphWidth + @props.settings.leftWidth, (hiddenSpace + 1) * graphWidth])
    handleScroll: (tr) ->
        timeScale = @getTimeScale().invert
        ts_delta = Math.round(timeScale(tr) - timeScale(0))
        @props.onChange(@props.min_ts - ts_delta, @props.max_ts - ts_delta)


    render: () ->
        view = @props.settings
        numChannels = _(@props.data).reduce( 
            (count, account) -> count + account.channels.length,
            0)
        timeScale = @getTimeScale()

        height = view.rowHeight * numChannels + view.timeScaleHeight + view.rowHeight * @props.data.length * view.channelPadding + view.timeScaleHeight
        <svg width={view.width} height={height}>
        <Draggable onChange={@handleScroll} freeze={@props.freeze} height={height} timeScale={timeScale}>
            <ViewPort data={@props.data} timeScale={timeScale} onChange={@props.onChange} showInfo={@props.showInfo} hideInfo={@props.hideInfo} view={view}  lastUpdate={@props.lastUpdate} />
        </Draggable>
            <ChannelList data={@props.data} width={view.leftWidth} view={view}  />
        </svg>