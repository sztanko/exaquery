moment = require('moment')
_ = require 'lodash'

Controls = React.createClass
    displayName: "Controls"
    timeFormat: d3.time.format('%Y-%m-%d %H:%M:%S.%L')
    numberFormat: d3.format("0,000")
    tickValues: [20, 75, 250, 1000, 4000, 15000, 30000, 60000, 180000, 300000, 900000, 1800000, 3600000, 7200000, 3600000 * 3, 3600000 * 4, 3600000 * 5]
    getInitialState: () ->
        @._submitChanges = _.debounce(@submitChanges, 300)
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
    render: ->
        scale = @getRangeScale()
        #return null
        return <div className="controls">
        <input type='text' value={@state.start_ts_f} name='start_ts_f' onChange={@handleChange}/>
        <input type='range' min='1' max={@tickValues.length} value={scale.invert(@state.dur)} name='dur' onChange={@handleChange}/>{@formatDur @state.dur}</div>

module.exports = Controls