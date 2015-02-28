Session = require('./session')

Channel = React.createClass
    displayName: 'Channel'
    shouldComponentUpdate: (nP, nS)->
        oldD = @props.timeScale.domain()
        newD = nP.timeScale.domain()
        if newD[0] == oldD[0] and newD[1] == oldD[1]
            return false
        true
    render: ->
        props = @props
        domain = props.timeScale.domain()
        sessions = _(@props.data.sessions)
            .filter (session) ->
                return session.start_time < domain[1] and session.end_time > domain[0]
            .map (session) ->
                <Session onClick={props.onClick} key={session.session_id} data={session} timeScale={props.timeScale} height={props.height} rowPadding={props.rowPadding} showInfo={props.showInfo} hideInfo={props.hideInfo}/>
            .value()
        transform = "translate(0, "+props.verticalOffset+")"
        <g className='channel' transform={transform}><g className='sessions'>{sessions}</g></g>
module.exports = Channel