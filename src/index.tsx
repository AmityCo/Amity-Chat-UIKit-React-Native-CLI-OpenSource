import AmityUiKitProvider from './providers/amity-ui-kit-provider';
import AmityUiKitChat from './routes/ChatNavigator';
import AmityPageRenderer from './routes/AmityPageRenderer';
import RecentChat from './screens/RecentChat/RecentChat';
import ChatRoom from './screens/ChatRoom/ChatRoom';
import { BackHandler } from 'react-native';

if (!(BackHandler as any).removeEventListener) {
  const listeners = new Map();
  const originalAddEventListener = BackHandler.addEventListener;

  BackHandler.addEventListener = (eventName, handler) => {
    const subscription = originalAddEventListener(eventName, handler);
    listeners.set(handler, subscription);
    return subscription;
  };

  (BackHandler as any).removeEventListener = (
    _eventName: string,
    handler: () => boolean
  ) => {
    const subscription = listeners.get(handler);
    if (subscription) {
      subscription.remove();
      listeners.delete(handler);
    }
  };
}

export {
  AmityUiKitProvider,
  AmityUiKitChat,
  AmityPageRenderer,
  RecentChat,
  ChatRoom,
};
