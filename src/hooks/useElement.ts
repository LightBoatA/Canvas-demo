import { useSelector, useDispatch } from 'react-redux';
import { IConnection, IShape } from '../pages/Canvas/common';
import { shapesSelector, shapesActions } from '../redux/shapesSlice';
import { connectionsSelector, connectionsActions } from '../redux/connectionsSlice';
import { historyManager } from '../utils/util';
import { useCallback } from 'react';

export const useElement = () => {
  const shapes = useSelector(shapesSelector);
  const connections = useSelector(connectionsSelector);
  const dispatch = useDispatch();

  const historyPush = useCallback(() => {
    historyManager.push({
      shapes,
      connections
    });
  }, [connections, shapes]);

  const setShapes = (data: IShape[]) => {
    historyPush();
    dispatch(shapesActions.setShapes(data));
  };

  const updateShapeByIds = (data: { ids: string[]; key: keyof IShape; data: any }) => {
    historyPush();
    dispatch(shapesActions.updateShapeByIds(data));
  };

  const setConnections = (data: IConnection[]) => {
    historyPush();
    dispatch(connectionsActions.setConnections(data));
  };

  const updateConnectionByIds = (data: { ids: string[]; key: keyof IConnection; data: any }) => {
    historyPush();
    dispatch(connectionsActions.updateConnectionByIds(data));
  };
  return {
    shapes,
    setShapes,
    updateShapeByIds,
    connections,
    setConnections,
    updateConnectionByIds
  };
};
