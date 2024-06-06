import { configureStore } from '@reduxjs/toolkit';
import numberReducer, { INumber } from "./numberSlice";

export type StoreState = {
    number: INumber;
}
export default configureStore({
    reducer: {
        number: numberReducer,
    },
})
