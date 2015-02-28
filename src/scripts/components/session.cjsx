Query = require './query'
QueryGroup = require './querygroup'
Session = React.createClass
    displayName: 'Session'
    clickHandler: (e) ->
        @props.zoomTo(@props.data.start_time, @props.data.end_time)
    render: ->
        props = @props
        tScale = @props.timeScale
        domain = @props.timeScale.domain()
        start_time = Math.max(tScale.domain()[0], @props.data.start_time)
        end_time = Math.min(tScale.domain()[1], @props.data.end_time)
        x = tScale(start_time)
        width = tScale(end_time) - x + 1
        y = @props.height * @props.rowPadding
        height = @props.height * (1 - 2 * @props.rowPadding)
        
        if width < 15
            queries = (<QueryGroup data={@props.data.q} timeScale={props.timeScale} rowPadding={props.rowPadding} x={x} y={y} height={height} width={width} zoomTo={props.zoomTo} showInfo={props.showInfo} hideInfo={props.hideInfo}/>)
        else
            queries = _(@props.data.q)
            .filter (q) ->
                return q.start_time< domain[1] and q.stop_time > domain[0] and tScale(q.stop_time) - tScale(q.start_time) >=0
            .map (q) ->
                key = q.sessiosn_id+"_"+q.stmt_id
                <Query key={key} data={q} timeScale={props.timeScale} rowPadding={props.rowPadding} height={props.height} zoomTo={props.zoomTo} showInfo={props.showInfo} hideInfo={props.hideInfo}/>
            .value()
        <g onClick={@clickHandler}>
            <rect className='session' x={x} y={y} width={width} height={height} />
            {queries}
        </g>

module.exports = Session
