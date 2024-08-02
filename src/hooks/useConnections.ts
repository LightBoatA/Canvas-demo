import { useSelector, useDispatch } from 'react-redux';
import { connectionsActions, connectionsSelector } from '../redux/connectionsSlice';
import { IConnection } from '../pages/Canvas/common';

export const useConnections = () => {
    const connections = useSelector(connectionsSelector);
    const dispatch = useDispatch();

    const setConnections = (data: IConnection[]) => {
        dispatch(connectionsActions.setConnections(data))
    }

    const updateConnectionByIds = (data: { ids: string[]; key: keyof IConnection; data: any }) => {
        dispatch(connectionsActions.updateConnectionByIds(data))
    }

    return { 
        connections,
        setConnections,
        updateConnectionByIds
    }
}