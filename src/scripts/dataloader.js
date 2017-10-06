import _ from 'lodash';
import $ from 'jquery';

// This function should return list of channels of sessions.
const makeSessionMap = function(sessions) {
  const sessionMap = _(sessions)
    .map(d => [d.session_id, d])
    .zipObject()
    .value();
  return sessionMap;
};

const makeChannels = function(data, sessionMap) {
  let channels = [];
  const findChannel = function(ts) {
    let ch = _(channels).find(c => c.ts <= ts);
    if (!ch) {
      ch = {
        ts,
        start_time: ts,
        sessions: []
      };
      channels.push(ch);
    }
    return ch;
  };
  const by_session = _(data)
    .groupBy(d => d['session_id'])
    .pairs()
    .map(function(d) {
      let k;
      return (k = {
        session_id: d[0],
        session: sessionMap[d[0]],
        start_time: _.min(d[1], 'start_time').start_time * 1000,
        end_time: _.max(d[1], 'stop_time').stop_time * 1000,
        q: _(d[1])
          .map(function(dd) {
            dd.start_time = dd.start_time * 1000;
            dd.stop_time = dd.stop_time * 1000;
            dd.session = sessionMap[d[0]];
            return dd;
          })
          .value()
      });
    })
    .sortBy(d => d.start_time)
    .forEach(function(d) {
      const ch = findChannel(d.start_time);
      ch.ts = d.end_time;
      if (ch.start_time > d.start_time) {
        ch.start_time = d.start_time;
      }
      return ch.sessions.push(d);
    });
  let index = 0;
  channels = _(channels)
    .sortBy(d => -(d.ts - d.start_time))
    .map(function(d) {
      d.index = index++;
      return d;
    })
    .value();
  return channels;
};

const groupSessions = function(d, session) {
  if (session) {
    return [session.user_name, session.os_user].join(' ');
  } else {
    return '_unkown session';
  }
};

const process = function(data, groupFunc) {
  const sessionMap = makeSessionMap(data.sessions);
  let index = 0;
  if (!groupFunc) {
    groupFunc = groupSessions;
  }
  return _(data.queries)
    .groupBy(function(q) {
      const a = groupFunc(q, sessionMap[q.session_id]);
      return a;
    })
    .pairs()
    .sortBy(gr => gr[0])
    .map(function(gr) {
      const channels = makeChannels(gr[1], sessionMap);
      const a = {
        key: gr[0],
        index,
        channels,
        start_time: _.min(channels, 'start_time').start_time,
        end_time: _.max(channels, 'ts').ts
      };
      channels.forEach(ch => (ch.index = index++));
      //index += channels.length
      return a;
    })
    .value();
};

class DataLoader {
  constructor(url) {
    this.url = url;
    this.cacheRange = { from: 0, to: 0 };
    this.cache = [];
    this.isLoading = false;
  }
  getData(fromTime, toTime, buffer, callBack) {
    if (
      this.isLoading ||
      (fromTime >= this.cacheRange.from && toTime <= this.cacheRange.to)
    ) {
      if (this.isLoading) {
        console.log(
          'Data is loading currently, so not requesting new data load'
        );
      } else {
        console.log(
          'Data range requested is already cached, just retrieving that'
        );
      }
      callBack(this.cache, this.isLoading);
      return false;
    }
    const duration = toTime - fromTime;
    const from = fromTime - duration * buffer;
    const to = toTime + duration * buffer;
    const url = this.url + '?from_ts=' + from + '&to_ts=' + to;
    const t = this;
    this.isLoading = true;
    //if t.cache.length>0
    callBack(t.cache, this.isLoading);
    console.log(`Calling ${url}`);
    $.getJSON(url, function(d) {
      t.cache = process(d);
      t.cacheRange.from = from; //_(t.cache).map('start_time').min().value()
      t.cacheRange.to = to; //_(t.cache).map('end_time').max().value()
      t.isLoading = false;
      callBack(t.cache, t.isLoading);
      return true;
    }).error(function() {
      console.log('Could not load url');
      t.isLoading = false;
      callBack(t.cache, t.isLoading);
      return alert('Error while loading url');
    });
    return true;
  }
}

//return makeChannels(data.queries, sessionMap)
//groupChannels (data, groupFunc) ->
//    return _(data).groupBy(groupFunc).value

export { process, DataLoader };
