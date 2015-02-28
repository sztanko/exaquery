
TimeScale = React.createClass
    dispalyName: 'TimeScale'
    componentDidMount: ->
        @d3_render()
    componentDidUpdate: (prevProps, prevState)->
        oldD = prevProps.timeScale.domain()
        d = @props.timeScale.domain()
        if oldD[0] != d[0] or oldD[1]!=d[1]
            @d3_render()
    getTimeFormat: ->
        #r = _(@props.timeScale.range()).map((x) -> x.getTime()).value()
        #r = (r[1]-r[0])/1000
        #if r>3600
        #    return d3.time.format('%H:%M')
        #return d3.time.format('%H:%M:%S.%L')
        #return d3.time.format('%H:%M')
        customTimeFormat = d3.time.format.multi([
                [".%L", (d) -> d.getMilliseconds() ],
                [":%S", (d) -> d.getSeconds() ],
                ["%I:%M", (d) -> d.getMinutes() ],
                ["%I %p", (d) -> d.getHours() ],
                ["%a %d", (d) -> d.getDay() and d.getDate() != 1 ],
                ["%b %d", (d) -> d.getDate() != 1 ],
                ["%B", (d) -> d.getMonth() ],
                ["%Y", () -> true ]
                ])
    d3_render: ->
        console.log("rerendering timescale")
        timeDomain = _(@props.timeScale.domain()).map((d) -> new Date(d)).value()
        scale = d3.time.scale().range(@props.timeScale.range()).domain(timeDomain)
        f = @getTimeFormat()
        axis = d3.svg.axis()
            .scale(scale)
            .tickSize(-@props.height)
            .tickSubdivide(true)
            .orient("top")
            #.ticks(40)
            #.ticks(d3.time.minute, 5)
            #.tickFormat(d3.time.format.multi)
        d3.select(this.getDOMNode()).call(axis)
        
        #scale.ticks(d3.time.minute, 15)
    render: ->
        <g transform={"translate(0,"+@props.timeScaleHeight+")"} className='timeScale'></g>

module.exports = TimeScale