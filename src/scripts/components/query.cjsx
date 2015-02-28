QueryPopup = require('./querypopup')
d3 = require 'd3'

Query = React.createClass
    displayName: 'Query'
    #scale: d3.scale.category20().domain(["COMMIT", "SELECT", "OPEN SCHEMA", "ROLLBACK", "TRUNCATE TABLE", "INSERT", "DELETE", "ALTER SESSION", "FLUSH STATISTICS", "DROP TABLE", "IMPORT", "CREATE TABLE", "NOT SPECIFIED", "GRANT OBJECT", "DESCRIBE", "DROP VIEW", "CREATE VIEW", "EXPORT", "MERGE", "NO OP", "UPDATE"])
    onMouseOver: (e) ->
        #console.log("mouseover query")
        if @props.showInfo
            @props.showInfo(@renderInfo, e)
    renderInfo: (popupProps) ->
        return <QueryPopup {...@props} />
    render: ->
        props = @props
        tScale = props.timeScale
        start_time = Math.max(tScale.domain()[0], props.data.start_time)
        stop_time = Math.min(tScale.domain()[1], props.data.stop_time)

        x = tScale(start_time)
        width = tScale(stop_time) - x
        if width<0.5
            width = 0.5
        isSuccess = if props.data.success then 'success' else 'fail'
        classStrings = _(['query', props.data.command_class, isSuccess, props.data.command_name])
            .map (d) -> d.replace(" ","_")
            .value()
            .join(' ')
        id=props.data.session_id+"_"+props.data.stmt_id
        y = props.height * props.rowPadding
        height = props.height * (1 - 2*props.rowPadding)
        #style =
        #    fill: @scale(@props.data.command_class)
        <rect  className={classStrings} x={x} id={id} width={width} y={y} height={height} onMouseOver={@onMouseOver} onMouseOut={@props.hideInfo}/>

module.exports = Query