import { useSelector, useDispatch } from 'react-redux';
import { shapesActions, shapesSelector } from '../redux/shapesSlice';
import { EElement, IShape } from '../pages/Canvas/common';
import { commonActions, commonSelector } from '../redux/commonSlices';

export const useCommon = () => {
    const commonState = useSelector(commonSelector);
    const { selectedMap } = commonState;
    const dispatch = useDispatch();

    const setSelectedMap = (data: Map<string, EElement>) => {
        dispatch(commonActions.setKeyValue({
            key: 'selectedMap',
            value: data
        }))
    }


    return { 
        selectedMap,
        setSelectedMap,
    }
}