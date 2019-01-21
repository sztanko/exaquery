import addChannelInfo from "./ChannelBuilder";
import { expect } from "chai";

const data = [
  {
    start_time: 0,
    stop_time: 10,
    group: "t1",
    expected_channel: 0,
    expected_offset: 0
  },
  {
    start_time: 5,
    stop_time: 15,
    group: "t1",
    expected_channel: 1,
    expected_offset: 1
  },
  {
    start_time: 10,
    stop_time: 16,
    group: "t1",
    expected_channel: 0,
    expected_offset: 0
  },
  {
    start_time: 0,
    stop_time: 15,
    group: "t1",
    expected_channel: 2,
    expected_offset: 2
  },
  {
    start_time: 0,
    stop_time: 10,
    group: "t2",
    expected_channel: 0,
    expected_offset: 3
  },
  {
    start_time: 5,
    stop_time: 16,
    group: "t2",
    expected_channel: 1,
    expected_offset: 4
  },
  {
    start_time: 11,
    stop_time: 15,
    group: "t2",
    expected_channel: 0,
    expected_offset: 3
  },
  {
    start_time: 0,
    stop_time: 15,
    group: "t3",
    expected_channel: 0,
    expected_offset: 5
  }
];

it("enriches data with channel info", () => {
  addChannelInfo(data);
  for (var d of data) {
    // console.log(d);
    expect(d).to.contain.all.keys("channel", "offset");
  }
});

it("enriches data with channel info", () => {
  addChannelInfo(data);
  for (var d of data) {
    expect(d.offset).equal(d.expected_offset);
    expect(d.channel).equal(d.expected_channel);
  }
});
