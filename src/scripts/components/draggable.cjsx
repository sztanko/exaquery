Draggable = React.createClass
    displayName: "Draggable"
    getDefaultProps: () ->
        return {freeze: false }
    getInitialState: () ->
        return {
            tr: 0
            isDrag: false
        }
    onScroll: (e) ->
        if not @props.freeze
            @pan(e.wheelDeltaX)
            e.stopPropagation()
            e.preventDefault()
            return true
        return true
    onMouseDown: (e) ->
        #console.log(e)
        #console.log(e.path)
        if true or _(e.path).map('nodeName').contains('svg')
            #console.log("mousedown")
            #console.log(e)
            #console.log("yay")
            @setState({isDrag: true, xPos: e.clientX})
            e.preventDefault()
        return true
    onMouseMove: (e) ->
        if @state.isDrag
            #console.log(e)
            @pan(e.clientX - @state.xPos, true)
            e.preventDefault()
            e.stopPropagation()
            return true
        return true
    onMouseUp: (e) ->
        #console.log("mouseup")
        @setState({isDrag: false})
        @changeProps()
        return true
    pan: (amount, absoluteTransition) ->
        if not absoluteTransition
            @setState({tr: @state.tr + amount})#, min_ts: min_ts, max_ts: max_ts})
        else
            @setState({tr: amount})
        @changeProps()
        return true
    _changeProps: () ->
        tr = @state.tr
        @setState({tr: 0})
        @props.onChange(tr)
        return true
    componentWillMount: () ->
        #window.addEventListener('DOMMouseScroll', @onScroll, false)
        window.addEventListener('mouseup', @onMouseUp)
        #window.addEventListener('mousedown', @onMouseDown)
        window.addEventListener('mousemove', @onMouseMove)
        t = @
        @changeProps = _.debounce(@_changeProps, 300)
        #window.onmousewheel = @onScroll
        #window.addEventListener('DOMMouseScroll', @onScroll, false)

    componentWillUnmount: ->
        #window.removeEventListener('DOMMouseScroll', @onScroll, false)
        #window.removeEventListener('mouseup', @onMouseUp, false)
        #window.removeEventListener('mousedown', @onMouseDown, false)
        #window.removeEventListener('mousemove', @onMouseMove, false)
        
    render: ->
        r = @props.timeScale.range()
        style = {fill: "white", cursor: "-webkit-grab", stroke: "none"}
        #onMouseDown={@onMouseDown} onMouseUp={@onMouseUp} onMouseMove={@onMouseMove}
        <g >
        <rect style={style} y=0 x={r[0]} height={@props.height} width={r[1] - r[0]} onMouseDown={@onMouseDown}/>
        <g className="draggable"  transform={"translate(" + @state.tr + ",0)"}>
            {this.props.children}
        </g>
        </g>

module.exports = Draggable