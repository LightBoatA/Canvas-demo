import { useSelector, useDispatch } from 'react-redux';
import { shapesActions, shapesSelector } from '../redux/shapesSlice';
import { IShape } from '../pages/Canvas/common';

export const useShapes = () => {
    const shapes = useSelector(shapesSelector);
    const dispatch = useDispatch();

    const setShapes = (data: IShape[]) => {
        dispatch(shapesActions.setShapes(data))
    }

    const updateShapeById = (data: { id: string; key: keyof IShape; data: any }) => {
        dispatch(shapesActions.updateShapeById(data))
    }

    return { 
        shapes,
        setShapes,
        updateShapeById
    }
}