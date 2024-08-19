import { configureStore } from '@reduxjs/toolkit';
import numberReducer, { INumber } from "./numberSlice";
import shapesReducer, { IShapes } from './shapesSlice';
import commonReducer from './commonSlices';
import { ICommon } from './commonSlices';
import connectionsReducer, { IConnections } from './connectionsSlice';


// 当前Redux应用的state存在于此store对象中
export type StoreState = {
    common: ICommon;
    number: INumber;
    shapes: IShapes;
    connections: IConnections
}

// store是通过传入一个reducer来创建的
export default configureStore({
    reducer: {
        common: commonReducer,
        number: numberReducer,
        shapes: shapesReducer,
        connections: connectionsReducer,
    },
})

// store有一个getState方法，它返回当前状态值
// 有一个dispatch方法，更新state