import { useCallback, useState, useMemo } from 'react';
import {
  IPoint,
  DEFAULT_POINT,
  IBounds,
  findElementsInBox,
  EElement,
  calcMultipleSelectRect
} from '../pages/Canvas/common';
import { mapToObject, objectToMap } from '../utils/util';
import { useCommon } from './useCommon';
import { useShapes } from './useShapes';
import { useConnections } from './useConnections';

export const useBoxSelection = () => {
  const { selectedMap, setSelectedMap, canvasPosition } = useCommon();
  const { shapes } = useShapes();
  const { connections } = useConnections();
  const [startPosition, setStartPosition] = useState<IPoint>(DEFAULT_POINT); // 框选起始点
  const [curPosition, setCurPosition] = useState<IPoint>(DEFAULT_POINT); // 框选当前点
  
  const boxStyles = useMemo(() => {
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
  }, [
    canvasPosition,
    curPosition.x,
    curPosition.y,
    startPosition.x,
    startPosition.y
  ]);
  
  const handleBoxSelection = useCallback(() => {
    const { top, left, width, height } = boxStyles;
    const bounds: IBounds = {
      top: top - canvasPosition[1],
      left: left - canvasPosition[0],
      right: left + width,
      bottom: top + height
    };
    const eleMap = findElementsInBox(bounds, shapes, connections);
    setSelectedMap(mapToObject<string, EElement>(eleMap));
  }, [boxStyles, canvasPosition, connections, setSelectedMap, shapes]);

  const updateSelectionBox = useCallback((offsetX: number, offsetY: number) => {
    setCurPosition({ x: offsetX, y: offsetY });
  }, []);

  const selectedShapes = useMemo(() => {
    if (Object.keys(selectedMap).length <= 0) return [];
    return shapes.filter(shape => selectedMap[shape.id]);
  }, [selectedMap, shapes]);

  const multipleSelectRect = useMemo(() => {
    const realMap = objectToMap<string, EElement>(selectedMap); // 锚点
    return calcMultipleSelectRect(realMap, connections, selectedShapes) || null;
  }, [connections, selectedMap, selectedShapes]);


  return {
    setStartPosition,
    setCurPosition,
    updateSelectionBox,
    handleBoxSelection,
    boxStyles,
    selectedShapes,
    multipleSelectRect
  }
};
