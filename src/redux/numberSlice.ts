import { createSlice } from '@reduxjs/toolkit';
import { StoreState } from './store';

export type INumber = {
    value: number;
}
export const NUMBER = 'number';
export const numberSlice = createSlice({
    name: NUMBER, // 用作每个action的type的第一部分，reducer函数名为第二部分
    initialState: {
        value: 0
    },
    reducers: {
        // 只能在此处编写mutation逻辑，它们在内部使用Immer
        updateNumber(state, action) {
            state.value = action.payload;
        }
    }
})

// actions 外部进行dispatch
export const numberActions = numberSlice.actions;

// selector函数可以从store状态树中提取指定的片段，提供外部使用
export const numberSelector = (state: StoreState) => state.number.value;
export default numberSlice.reducer;