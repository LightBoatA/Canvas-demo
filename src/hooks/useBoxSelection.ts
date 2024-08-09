import { useCallback, useState, useMemo } from 'react';
import {
  IPoint,
  DEFAULT_POINT,
  IBounds,
  findElementsInBox,
  EElement } from '../pages/Canvas/common';
import { mapToObject } from '../utils/util';
import { useCommon } from './useCommon';
import { useElement } from './useElement';

/**
 * 注意坐标转换：
 * 蒙版是相对于灰色工作区域左上角的，实际的offset值
 * 画布坐标：画布的一个小格子就是15px，无论如何缩放，图形的坐标及宽度都是按画布单位计算的
 * 相交判断时：真实坐标转换成画布坐标
 *  */
export const useBoxSelection = () => {
  const { setSelectedMap, canvasPosition, canvasScale } = useCommon();
  const { shapes, connections } = useElement();
  const [startPosition, setStartPosition] = useState<IPoint>(DEFAULT_POINT); // 框选起始点
  const [curPosition, setCurPosition] = useState<IPoint>(DEFAULT_POINT); // 框选当前点
  
  const boxStyles = useMemo(() => {
    // 蒙版是相对于灰色工作区域左上角的，实际的offset值
    const minX = Math.min(curPosition.x, startPosition.x);
    const minY = Math.min(curPosition.y, startPosition.y);
    const width = Math.abs(curPosition.x - startPosition.x);
    const height = Math.abs(curPosition.y - startPosition.y);
    return {
      top: minY + canvasPosition[1],
      left: minX + canvasPosition[0],
      width,
      height,
      backgroundColor: 'rgba(0, 0, 255, 0.3)',
      border: '1px solid blue'
    };
  }, [canvasPosition, curPosition, startPosition]);
  
  const handleBoxSelectEnd = useCallback(() => {
    const { top, left, width, height } = boxStyles;
    // 减去舞台位置影响，才是相对于画布的真实坐标，再转换成画布坐标
    const newTop = (top - canvasPosition[1]) / canvasScale;
    const newLeft = (left - canvasPosition[0]) / canvasScale;
    const bounds: IBounds = {
      top: newTop,
      left: newLeft,
      right: newLeft + width / canvasScale,
      bottom: newTop + height / canvasScale
    };
    const eleMap = findElementsInBox(bounds, shapes, connections);
    setSelectedMap(mapToObject<string, EElement>(eleMap));
  }, [boxStyles, canvasPosition, canvasScale, connections, setSelectedMap, shapes]);

  const handleBoxSelecting = useCallback((offsetX: number, offsetY: number) => {
    setCurPosition({ x: offsetX, y: offsetY });
  }, []);

  const handleBoxSelectStart = useCallback((startPoint: IPoint) => {
    setStartPosition(startPoint);
    setCurPosition(startPoint);
  }, [])

  return {
    handleBoxSelectStart,
    handleBoxSelecting,
    handleBoxSelectEnd,
    boxStyles,
  }
};
