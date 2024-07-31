import { configureStore } from '@reduxjs/toolkit';
import numberReducer, { INumber } from "./numberSlice";


// 当前Redux应用的state存在于此store对象中
export type StoreState = {
    number: INumber;
}

// store是通过传入一个reducer来创建的
export default configureStore({
    reducer: {
        number: numberReducer,
    },
})

// store有一个getState方法，它返回当前状态值
// 有一个dispatch方法，更新state