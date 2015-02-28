_ = require 'lodash'
$ = require 'jquery'

# This function should return list of channels of sessions.
makeSessionMap = (sessions) ->
    sessionMap = _(sessions)
        .map (d) ->
            [d.session_id, d]
        .zipObject()
        .value()
    return sessionMap


makeChannels = (data, sessionMap) ->
   channels = []
   findChannel = (ts) ->
        ch = _(channels).find (c) ->
            return c.ts <=ts
        if not ch
            ch =
                ts: ts
                start_time: ts
                sessions: []
            channels.push(ch)
        ch
    by_session = _(data)
        .groupBy (d) ->
            d['session_id']
        .pairs()
        .map (d) ->
            k =
                session_id: d[0]
                session: sessionMap[d[0]]
                start_time: _.min(d[1], 'start_time').start_time * 1000
                end_time: _.max(d[1], 'stop_time').stop_time * 1000
                q: _(d[1]).map (dd) ->
                    dd.start_time = dd.start_time * 1000
                    dd.stop_time = dd.stop_time * 1000
                    dd.session = sessionMap[d[0]]
                    dd
                .value()
        .sortBy( (d) -> d.start_time)
        .forEach (d) ->
            ch = findChannel(d.start_time)
            ch.ts = d.end_time
            if ch.start_time > d.start_time
                ch.start_time = d.start_time
            ch.sessions.push(d)
    index = 0
    channels = _(channels)
            .sortBy (d) -> -(d.ts - d.start_time)
            .map (d) ->
                d.index = index++
                return d
            .value()
    return channels

groupSessions = (d, session) ->
        if session
            return [session.user_name, session.os_user].join(' ')
        else
            return '_unkown session'

process = (data, groupFunc) ->
    sessionMap = makeSessionMap(data.sessions)
    index = 0
    if not groupFunc
        groupFunc = groupSessions
    return _(data.queries)
        .groupBy (q) ->
            a = groupFunc(q, sessionMap[q.session_id])
            return a
        .pairs()
        .sortBy (gr) -> gr[0]
        .map (gr) ->
            channels = makeChannels(gr[1], sessionMap)
            a = {
                key: gr[0]
                index: index
                channels: channels
                start_time: _.min(channels, 'start_time').start_time
                end_time: _.max(channels, 'ts').ts
            }
            channels.forEach (ch) ->
                ch.index = index++
            #index += channels.length
            return a
        .value()

class DataLoader
    constructor: (url) ->
        @url = url
        @cacheRange = {from: 0, to: 0}
        @cache = []
        @isLoading = false
    getData: (fromTime, toTime, buffer, callBack) ->
        if @isLoading or (fromTime >= @cacheRange.from and toTime<=@cacheRange.to)
            if @isLoading
                console.log("Data is loading currently, so not requesting new data load")
            else
                console.log("Data range requested is already cached, just retrieving that")
            callBack(@cache, @isLoading)
            return false
        duration = (toTime - fromTime)
        from = fromTime - duration * buffer
        to = toTime + duration * buffer
        url = @url+"?from_ts="+from+"&to_ts="+to
        t = @
        @isLoading = true
        #if t.cache.length>0
        callBack(t.cache, @isLoading)
        console.log("Calling "+url)
        $.getJSON(url, (d) ->
            t.cache = process(d)
            t.cacheRange.from = from #_(t.cache).map('start_time').min().value()
            t.cacheRange.to = to #_(t.cache).map('end_time').max().value()
            t.isLoading = false
            callBack(t.cache, t.isLoading)
            return true
        ).error(() ->
            console.log("Could not load url")
            t.isLoading = false
            callBack(t.cache, t.isLoading)
            alert("Error while loading url")
            )
        return true



    #return makeChannels(data.queries, sessionMap)
#groupChannels (data, groupFunc) ->
#    return _(data).groupBy(groupFunc).value
    

module.exports = { process: process, DataLoader: DataLoader}

            

