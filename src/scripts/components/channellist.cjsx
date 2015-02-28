
ChannelList = React.createClass
    displayName: 'ChannelList'
    render: ->
        height = @props.view.rowHeight
        props = @props
        totalHeight = 0
        channelPadding = @props.view.channelPadding
        channelNames = _(@props.data)
            .map (d, groupIndex) ->
                textPos = height * (d.channels.length + channelPadding)
                totalHeight += textPos
                tr = "translate(0,"+(height*d.index + groupIndex * height * channelPadding)+")"
                <g transform={tr} key={d.index} className="channelName">
                    <rect x=0 y=0 height={textPos} width={props.view.width} />
                    <text y={textPos/2} x="15">{d.key}</text>
                </g>
            .value()

        <g className='channelList' transform={"translate(0,"+@props.view.timeScaleHeight+")"}>
            <rect x=0 y=0 height={totalHeight} width={@props.width} className="background"/>
            {channelNames}
        </g>
module.exports = ChannelList