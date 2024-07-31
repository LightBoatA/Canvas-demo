import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { StoreState } from './store';
import { IShape } from '../pages/Canvas/common';

export type IShapes = {
  value: IShape[];
};
export const SHAPES = 'shapes';
export const shapesSlice = createSlice({
  name: SHAPES, // 用作每个action的type的第一部分，reducer函数名为第二部分
  initialState: {
    value: [] as IShape[]
  },
  reducers: {
    // addShape(state, action) {
    //   state.value.push(action.payload);
    // },
    // deleteShapes(state, actions: PayloadAction<{ ids: string }>) {
    //     state.value = state.value.filter(item => !actions.payload.ids.includes(item.id))
    // },
    // 整体替换
    setShapes(state, action) {
      state.value = action.payload;
    },

    updateShapeByIds(
      state,
      action: PayloadAction<{ ids: string[]; key: keyof IShape; data: any }>
    ) {
      const { ids, key, data } = action.payload;
      const shapes = state.value.filter(item => ids.includes(item.id));
      if (shapes) {
        shapes.forEach(shape => {
          (shape as any)[key] = data; 
        });
      }
    }
  }
});

// actions 外部进行dispatch
export const shapesActions = shapesSlice.actions;

// selector函数可以从store状态树中提取指定的片段，提供外部使用
export const shapesSelector = (state: StoreState) => state.shapes.value;
export default shapesSlice.reducer;
