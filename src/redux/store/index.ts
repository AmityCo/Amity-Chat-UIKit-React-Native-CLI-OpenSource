import { Store, configureStore } from '@reduxjs/toolkit';

import RecentChatSlice from '../slices/RecentChatSlice';
import connectionStateSlice from '../slices/ConnectionStateSlice';

export const store: Store = configureStore({
  reducer: {
    recentChat: RecentChatSlice.reducer,
    connectionState: connectionStateSlice.reducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
