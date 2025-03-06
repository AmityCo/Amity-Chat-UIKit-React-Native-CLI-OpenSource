import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type ConnectionState = {
  connectionState: Amity.RTEConnectionState;
};
const initialState: ConnectionState = {
  connectionState: 'disconnected',
};

const connectionStateSlice = createSlice({
  name: 'connectionStateSlice',
  initialState,
  reducers: {
    updateConnectionState: (_, action: PayloadAction<ConnectionState>) => {
      return action.payload;
    },
  },
});

export default connectionStateSlice;
