Session = require('./session')

Channel = React.createClass
    displayName: 'Channel'
    shouldComponentUpdate: (np, nS)->
        oldD = @props.timeScale.domain()
        newD = np.timeScale.domain()
        if newD[0] == oldD[0] and newD[1] == oldD[1] and np.lastUpdate==@props.lastUpdate
            #console.log("Channel will not update")
            return false
        #console.log("Channel will update")
        true
    render: ->
        props = @props
        domain = props.timeScale.domain()
        range = props.timeScale.range()
        sessions = _(@props.data.sessions)
            .filter (session) ->
                return session.start_time < domain[1] and session.end_time > domain[0]
            .map (session) ->
                <Session onClick={props.onClick} key={session.session_id} data={session} timeScale={props.timeScale} height={props.height} rowPadding={props.rowPadding} zoomTo={props.zoomTo} showInfo={props.showInfo} hideInfo={props.hideInfo}/>
            .value()
        transform = "translate(0, "+props.verticalOffset+")"
        <g className='channel' transform={transform}>
            <line y1=0 y2=0 x1={range[0]} x2={range[1]} />
            <g className='sessions'>{sessions}</g></g>
module.exports = Channel