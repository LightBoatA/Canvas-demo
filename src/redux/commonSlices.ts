import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreState } from './store';
import { ISelectedMapObj } from '../pages/Canvas/common';

export type ICommon = {
  selectedMap: ISelectedMapObj,
  canvasPosition: number[],
  canvasScale: number,
};
export const COMMON = 'common';
export const commonSlice = createSlice({
  name: COMMON, // 用作每个action的type的第一部分，reducer函数名为第二部分
  initialState: {
    selectedMap: {},
    canvasPosition: [20, 20],
    canvasScale: 1,
  },
  reducers: {
    setKeyValue(state, action: PayloadAction<{ key: keyof ICommon, value: any }>) {
      const { key, value } = action.payload;
      state[key] = value;
    }
  }
});

// actions 外部进行dispatch
export const commonActions = commonSlice.actions;

// selector函数可以从store状态树中提取指定的片段，提供外部使用
export const commonSelector = (state: StoreState) => state.common;
export default commonSlice.reducer;
