import { useSelector, useDispatch } from 'react-redux';
import { IConnection, IShape } from '../pages/Canvas/common';
import { shapesSelector, shapesActions } from '../redux/shapesSlice';
import { connectionsSelector, connectionsActions } from '../redux/connectionsSlice';

export const useElement = () => {
  const shapes = useSelector(shapesSelector);
  const connections = useSelector(connectionsSelector);
  const dispatch = useDispatch();

  const setShapes = (data: IShape[]) => {
    dispatch(shapesActions.setShapes(data));
  };

  const updateShapeByIds = (data: { ids: string[]; key: keyof IShape; data: any }) => {
    dispatch(shapesActions.updateShapeByIds(data));
  };

  const setConnections = (data: IConnection[]) => {
    dispatch(connectionsActions.setConnections(data));
  };

  const updateConnectionByIds = (data: { ids: string[]; key: keyof IConnection; data: any }) => {
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
