import { useCallback, useState } from 'react';
import {
  ICtrlPoint,
  IRect,
  IShapeConnectionPoint,
  getIntersectedConnectionPoint,
  getIntersectedControlPoint,
  isPointInLine,
  isPointInShape
} from '../pages/Canvas/common';
import { useElement } from './useElement';

export const useHovering = () => {
  const { shapes, connections } = useElement();
  // 鼠标悬停在缩放控制点上
  const [hoveringCtrlPoint, setHoveringCtrlPoint] = useState<ICtrlPoint | null>(null);
  // 鼠标悬停在形状上
  const [hoveringId, setHoveringId] = useState<string>('');
  const [hoveringConnectionId, setHoveringConnectionId] = useState<string>('');
  const [hoveringConnectionPoint, setHoveringConnectionPoint] = useState<IShapeConnectionPoint | null>(null);

  const setHoveringElement = useCallback(
    (multipleSelectRect: IRect | null, offsetX: number, offsetY: number) => {
      const [hoveringShape] = shapes.filter(shape => isPointInShape(offsetX, offsetY, shape));
      const [hoveringConnection] = connections.filter(connection => isPointInLine(offsetX, offsetY, connection.id));
      // 设置悬停连接线
      hoveringConnection ? setHoveringConnectionId(hoveringConnection.id) : setHoveringConnectionId('');
      // 设置悬停形状
      hoveringShape ? setHoveringId(hoveringShape.id) : setHoveringId('');
      // 设置悬停缩放控制点
      if (multipleSelectRect) {
        const ctrlPoint = getIntersectedControlPoint(offsetX, offsetY, multipleSelectRect);
        setHoveringCtrlPoint(ctrlPoint);
      }
      // 设置悬停连接点
      const connectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
      connectionPoint ? setHoveringConnectionPoint(connectionPoint) : setHoveringConnectionPoint(null);
    },
    [connections, shapes]
  );

  return {
    setHoveringElement,
    hoveringCtrlPoint,
    hoveringId,
    hoveringConnectionId,
    hoveringConnectionPoint
  };
};
