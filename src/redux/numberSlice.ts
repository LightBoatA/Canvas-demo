import { createSlice } from '@reduxjs/toolkit';
import { StoreState } from './store';

export type INumber = {
    value: number;
}
export const NUMBER = 'number';
export const numberSlice = createSlice({
    name: NUMBER,
    initialState: {
        value: 0
    },
    reducers: {
        updateNumber(state, action) {
            state.value = action.payload;
        }
    }
})

// actions 外部进行dispatch
export const numberActions = numberSlice.actions;

// 提供外部使用
export const numberSelector = (state: StoreState) => state.number.value;
export default numberSlice.reducer;