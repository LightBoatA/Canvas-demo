import { useCallback, useEffect, useMemo, useRef } from 'react';
import { getCanvasEle } from '../utils/util';
import {
  CANVAS_WIDTH,
  CANVAS_HEITHT,
  drawShape,
  IShape,
  IConnection,
  IShapeConnectionPoint,
  IHelpLineData,
  IRect
} from '../pages/Canvas/common';

/**
 * 项目里没有使用
 */
export const useDrawing = (
  isFrequentlyUpdating: boolean,
  shapes: IShape[],
  localShapes: IShape[],
  hoveringId: string,
  hoveringConnectionId: string,
  preparedConnection: IConnection,
  connections: IConnection[],
  hoveringConnectionPoint: IShapeConnectionPoint,
  helpLineVals: IHelpLineData,
  multipleSelectRect: IRect,
  canvasScale: number
) => {
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const canvasEle = useMemo(() => {
    return getCanvasEle();
  }, []);
  useEffect(() => {
    if (canvasEle && !ctxRef.current) {
      ctxRef.current = canvasEle.getContext('2d');
    }
  }, [canvasEle]);

  const clearCanvas = useCallback(() => {
    if (ctxRef.current) {
      ctxRef.current.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEITHT);
    }
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      clearCanvas();
      drawShape(
        ctxRef.current,
        isFrequentlyUpdating ? localShapes : shapes, // 移动优化，移动过程中使用本地数据
        hoveringId,
        hoveringConnectionId,
        preparedConnection,
        connections,
        hoveringConnectionPoint,
        helpLineVals,
        multipleSelectRect,
        canvasScale
      );
    }
  }, [
    canvasScale,
    clearCanvas,
    connections,
    helpLineVals,
    hoveringConnectionId,
    hoveringConnectionPoint,
    hoveringId,
    isFrequentlyUpdating,
    localShapes,
    multipleSelectRect,
    preparedConnection,
    shapes
  ]);
};
