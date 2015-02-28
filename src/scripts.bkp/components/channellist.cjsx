
ChannelList = React.createClass
    displayName: 'ChannelList'
    render: ->
        height = @props.height
        totalHeight = 0
        channelNames = _(@props.data)
            .map (d) ->
                textPos = height * (d.channels.length)
                totalHeight += textPos
                tr = "translate(0,"+(height*d.index)+")"
                <g transform={tr} key={d.index} className="channelName">
                    <rect x=0 y=0 height={textPos} width={1200} />
                    <text y={textPos/2} x="15">{d.key}</text>

                </g>
            .value()

        <g className='channelList' transform={this.props.transform}>
            <rect x=0 y=0 height={totalHeight} width={@props.width} className="background"/>
            {channelNames}
        </g>
module.exports = ChannelList