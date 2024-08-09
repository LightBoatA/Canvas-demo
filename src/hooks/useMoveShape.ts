import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { DEFAULT_MOUSE_INFO, IHelpLineData, IMoveStartInfo, IRect, IShape, getConnectionPointVal, getSnapData } from '../pages/Canvas/common';
import { useElement } from './useElement';
import { useCommon } from './useCommon';
import { deepClone } from '../utils/util';

export const useMoveShape = (
  setHelpLineVals: Dispatch<SetStateAction<IHelpLineData>>,
  localShapes: IShape[],
  setLocalShapes: Dispatch<SetStateAction<IShape[]>>,
  setIsFrequentlyUpdating: Dispatch<SetStateAction<boolean>>
) => {
  const [moveStartInfo, setMoveStartInfo] = useState<IMoveStartInfo>(DEFAULT_MOUSE_INFO);
  const { shapes, setShapes } = useElement();
  const { selectedMap } = useCommon();

  const handleMoveStart = useCallback(
    (info: IMoveStartInfo) => {
      setMoveStartInfo(info);
      setIsFrequentlyUpdating(true);
      setLocalShapes(deepClone(shapes));
    },
    [setIsFrequentlyUpdating, setLocalShapes, shapes]
  );

  const handleMoveEnd = useCallback(() => {
    setMoveStartInfo(DEFAULT_MOUSE_INFO);
    setIsFrequentlyUpdating(false);
    setShapes(deepClone(localShapes));
    setLocalShapes([]);
  }, [localShapes, setIsFrequentlyUpdating, setLocalShapes, setShapes]);

  const selectedShapes = useMemo(() => {
    if (Object.keys(selectedMap).length <= 0) return [];
    return shapes.filter(shape => selectedMap[shape.id]);
  }, [selectedMap, shapes]);

  const handleMoving = useCallback(
    (newX: number, newY: number) => {
      const { rectOffset, offsetMap, rectInfo } = moveStartInfo;
      const { rectWidth, rectHeight } = rectInfo;
      const newRectX = newX - rectOffset.distanceX;
      const newRectY = newY - rectOffset.distanceY;
      const selectedShapeIds = selectedShapes.map(shape => shape.id);
      const { snapX: rectSnapX, snapY: rectSnapY, helpLine } = getSnapData(newRectX, newRectY, rectWidth, rectHeight, selectedShapeIds, shapes);
      setHelpLineVals(helpLine);
      const newShapes = localShapes.map(shape => {
        if (selectedMap[shape.id]) {
          const { width, height, id } = shape;
          const distanceData = offsetMap.get(id);
          const distanceX = distanceData?.distanceX || 0;
          const distanceY = distanceData?.distanceY || 0;
          const shapeX = rectSnapX - distanceX;
          const shapeY = rectSnapY - distanceY;
          return {
            ...shape,
            x: shapeX,
            y: shapeY,
            connectionPoints: shape.connectionPoints.map(point => getConnectionPointVal(shapeX, shapeY, width, height, point.direction))
          };
        } else return shape;
      });
      setLocalShapes(newShapes);
    },
    [localShapes, moveStartInfo, selectedMap, selectedShapes, setHelpLineVals, setLocalShapes, shapes]
  );

  return {
    handleMoving,
    handleMoveStart,
    handleMoveEnd
  };
};
