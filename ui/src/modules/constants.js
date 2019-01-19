export const GROUP_LIST_WIDTH = 350;
export const CHANNEL_HEIGHT = 10;
export const CHANNEL_PADDING = 2;
export const GROUP_PADDING = 3;

export function channelYScale(channel_no, group_no) {
  return (
    channel_no * CHANNEL_HEIGHT + group_no * GROUP_PADDING * 2 + GROUP_PADDING
  );
}
