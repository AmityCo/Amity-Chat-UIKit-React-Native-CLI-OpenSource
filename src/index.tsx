import AmityUiKitProvider from './providers/amity-ui-kit-provider';
import AmityUiKitChat from './routes/ChatNavigator';
import React from 'react';

interface ChatRoomProps {
  defaultChannelId: string;
}
const ChatRoomPageScreen = ({ defaultChannelId }: ChatRoomProps) => {
  return <AmityUiKitChat channelId={defaultChannelId} screen='ChatRoom' />
}


export {
  AmityUiKitProvider,
  ChatRoomPageScreen as ChatRoomPage,
  AmityUiKitChat,
};
