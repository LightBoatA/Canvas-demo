import { useCallback } from "react";
import { getIntersectedConnectionPoint, COLOR_BORDER, IShapeConnectionPoint } from "../pages/Canvas/common";
import { getCryptoUuid } from "../utils/util";
import { useElement } from "./useElement";

export const useAddConnection = () => {
  const { shapes, connections, setConnections } = useElement();
  const handleAddConnection = useCallback((startConnectionPoint: IShapeConnectionPoint | null, offsetX: number, offsetY: number) => {
    const connectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
    if (connectionPoint && startConnectionPoint) {
      const { shape, point } = startConnectionPoint;
      setConnections([
        ...connections,
        {
          id: getCryptoUuid(),
          fromShape: shape,
          fromPoint: point,
          toShape: connectionPoint.shape,
          toPoint: connectionPoint.point,
          strokeColor: COLOR_BORDER
        }
      ]);
    }
  }, [connections, setConnections, shapes])

  return {
    handleAddConnection
  }
}