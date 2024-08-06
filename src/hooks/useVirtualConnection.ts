import { useCallback, useState } from "react";
import { IShape, IConnectionPoint, getVirtualEndPoint, COLOR_BORDER, IShapeConnectionPoint, IConnection } from "../pages/Canvas/common";

/**
 * 虚连线 
 */
export const useVirtualConnections = (hoveringConnectionPoint: IShapeConnectionPoint | null) => {
  const [startConnectionPoint, setStartConnectionPoint] = useState<IShapeConnectionPoint | null>(null);
  const [preparedConnection, setPreparedConnection] = useState<IConnection | null>(null);
  // const [hoveringConnectionPoint, setHoveringConnectionPoint] = useState<IShapeConnectionPoint | null>(null);
  
  const drawVirtualConnection = useCallback(
    (offsetX: number, offsetY: number) => {
      // 从连接点到鼠标移动位置画虚线
      if (startConnectionPoint) {
        const { shape, point } = startConnectionPoint;
        const { x: fromX, y: fromY } = point;
        let toShape: IShape, toPoint: IConnectionPoint;
        // 鼠标移到了目标连接点上
        if (hoveringConnectionPoint) {
          toShape = hoveringConnectionPoint.shape;
          toPoint = hoveringConnectionPoint.point;
        } else {
          // 鼠标移到的地方没有形状及连接点
          const endPoint = getVirtualEndPoint(offsetX, offsetY, fromX, fromY);
          toShape = endPoint.shape;
          toPoint = endPoint.point;
        }

        setPreparedConnection({
          id: 'prepared-connection',
          fromShape: shape,
          fromPoint: point,
          toPoint,
          toShape,
          strokeColor: COLOR_BORDER
        });
      }
    },
    [hoveringConnectionPoint, startConnectionPoint]
  );

  return {
    setStartConnectionPoint,
    setPreparedConnection,
    preparedConnection,
    hoveringConnectionPoint,
    startConnectionPoint,
    drawVirtualConnection
  }
}