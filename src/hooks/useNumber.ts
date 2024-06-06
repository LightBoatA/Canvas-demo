import { useSelector, useDispatch } from 'react-redux';
import { numberSelector, numberActions } from '../redux/numberSlice';

export const useNumber = () => {
    const number = useSelector(numberSelector);
    const dispatch = useDispatch();

    const updateNumber = (data: number) => {
        dispatch(numberActions.updateNumber(data))
    }

    return { 
        number,
        updateNumber,
    }
}