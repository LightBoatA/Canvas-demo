import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreState } from './store';
import { IConnection } from '../pages/Canvas/common';

export type IConnections = {
  value: IConnection[];
};
export const CONNECTIONS = 'connections';
export const connectionsSlice = createSlice({
  name: CONNECTIONS, // 用作每个action的type的第一部分，reducer函数名为第二部分
  initialState: {
    value: [] as IConnection[]
  },
  reducers: {
    // 整体替换
    setConnections(state, action) {
      state.value = action.payload;
    },

    updateConnectionByIds(
      state,
      action: PayloadAction<{
        ids: string[];
        key: keyof IConnection;
        data: any;
      }>
    ) {
      const { ids, key, data } = action.payload;
      if (ids.length) {
        const connections = state.value.filter(item => ids.includes(item.id));
        if (connections) {
          connections.forEach(connection => {
            (connection as any)[key] = data;
          });
        }
      }
    }
  }
});

// actions 外部进行dispatch
export const connectionsActions = connectionsSlice.actions;

// selector函数可以从store状态树中提取指定的片段，提供外部使用
export const connectionsSelector = (state: StoreState) =>
  state.connections.value;
export default connectionsSlice.reducer;
