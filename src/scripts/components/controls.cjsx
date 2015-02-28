moment = require('moment')
_ = require 'lodash'
d3 = require('d3')

Controls = React.createClass
    displayName: "Controls"
    numberFormat: d3.format("0,000")
    tickValues: [20, 75, 250, 1000, 4000, 15000, 30000, 60000, 180000, 300000, 900000, 1800000, 3600000, 7200000, 3600000 * 3, 3600000 * 4, 3600000 * 5]
    getInitialState: () ->
        timeFormat = d3.time.format('%Y-%m-%d %H:%M:%S.%L')
        @timeFormat = timeFormat
        @._submitChanges = _.debounce(@submitChanges, 300)   
        dur = Math.round(@props.max_ts - @props.min_ts)
        return {
            start_ts_f: timeFormat(new Date(+@props.min_ts))
            dur: Math.round(dur)
        }
    componentWillReceiveProps: (np)->
        dur = Math.round(np.max_ts - np.min_ts)
        @setState({start_ts_f: @timeFormat(new Date(+np.min_ts)), dur: dur})
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
        @_submitChanges()
    submitChanges: () ->
        if from_date = @timeFormat.parse(@state.start_ts_f)
            from_ts = from_date.getTime()
            to_ts = @state.dur + from_ts
            @props.onChange(from_ts, to_ts)
    render: ->
        scale = @getRangeScale()
        isLoading = null
        if @props.isLoading
            isLoading = <div className="loading">fetching data from server</div>
        #return null
        return <div className="controls">
        Start: <input type='text' value={@state.start_ts_f} name='start_ts_f' onChange={@handleChange}/>
        Window range: <input type='range' min='1' max={@tickValues.length} value={scale.invert(@state.dur)} name='dur' onChange={@handleChange}/>{@formatDur @state.dur}
        {isLoading}
        </div>

module.exports = Controls