QueryPopup = require('./querypopup')
d3 = require 'd3'

QueryGroup = React.createClass
    displayName: 'QueryGroup'
    onMouseOver: (e) ->
        #console.log("mouseover query")
        if @props.showInfo
            @props.showInfo(@renderInfo, e)
    renderInfo: (popupProps) ->
        props = @props
        queries = _(@props.data).sortBy('stmt_id').map (d) ->
            <QueryPopup {...props} data={d} simplifiedView={true}/>
        id=_(@props.data).map('session_id').first()
        return <div className='querygroup'>
            <h3>Session {id}, {@props.data.length} statements</h3>
            {queries}</div>
    render: ->
        props = @props
        tScale = props.timeScale

        isSuccess = if _(props.data).map('success').all() then 'success' else 'fail'
        classStrings = _(['querygroup', isSuccess])
            .map (d) -> d.replace(" ","_")
            .value()
            .join(' ')
        id=_(props.data).map('session_id').first()
        <rect  className={classStrings} x={@props.x} id={id} width={@props.width} y={@props.y} height={@props.height} onMouseOver={@onMouseOver} onMouseOut={@props.hideInfo}/>

module.exports = QueryGroup