import { useSelector, useDispatch } from 'react-redux';
import { EElement } from '../pages/Canvas/common';
import { commonActions, commonSelector } from '../redux/commonSlices';

export const useCommon = () => {
    const commonState = useSelector(commonSelector);
    const { selectedMap, canvasPosition, canvasScale } = commonState;
    const dispatch = useDispatch();

    const setSelectedMap = (data: { [key: string]: EElement }) => {
        dispatch(commonActions.setKeyValue({
            key: 'selectedMap',
            value: data
        }))
    }

    const updateCanvasPosition = (data: number[]) => {
        dispatch(commonActions.setKeyValue({
            key: 'canvasPosition',
            value: data
        }))
    }

    const updateCanvasScale = (data: number) => {
        dispatch(commonActions.setKeyValue({
            key: 'canvasScale',
            value: data
        }))
    }
    
    return { 
        canvasPosition,
        updateCanvasPosition,
        selectedMap,
        setSelectedMap,
        canvasScale,
        updateCanvasScale
    }
}