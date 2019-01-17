/**
 * Get
 * @param {*} channel_timestamps
 * @param {*} start_time
 */
function findFirstSuitableChannel(channel_timestamps, start_time) {
  //console.log("Channel timestamps:", channel_timestamps);
  let index = 0;
  for (const channel_last_time of channel_timestamps) {
    if (channel_last_time <= start_time) return index;
    index++;
  }

  return null;
}

/**
 * We assume data is already sorted by start_time
 * @param {*} data
 */
function getChannelsForGroup(data, offset, group_offset, group_id) {
  let channel_stamps = [];
  const group = data[offset].group;
  //console.log("Group is ", group)
  let i = offset;
  while (i < data.length && data[i].group === group) {
    let d = data[i];
    let channel_id = findFirstSuitableChannel(channel_stamps, d.start_time);

    if (channel_id === null) {
      channel_stamps.push(0);
      channel_id = channel_stamps.length - 1;
    }
    channel_stamps[channel_id] = d.stop_time;
    // console.log("Setting the ts of channel", channel_id, "to", d.stop_time)
    d["channel"] = channel_id;
    d["offset"] = group_offset + channel_id;
    d["group_id"] = group_id;
    i++;
  }
  return [group, i, channel_stamps.length];
}

function addChannelInfo(data) {
  let groups = [];
  let offset = 0;
  let group_offset = 0;
  let i = 0;
  while (offset < data.length) {
    const [group, next_offset, channel_size] = getChannelsForGroup(
      data,
      offset,
      group_offset,
      i
    );
    groups.push({
      group: group,
      offset: group_offset,
      size: channel_size,
      index: i
    });
    group_offset += channel_size;
    offset = next_offset;
    i++;
  }
  return [groups, group_offset];
}

export default addChannelInfo;
