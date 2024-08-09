import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { DEFAULT_MOUSE_INFO, IHelpLineData, IMoveStartInfo, IRect, IShape, getConnectionPointVal, getSnapData } from '../pages/Canvas/common';
import { useElement } from './useElement';
import { useCommon } from './useCommon';
import { deepClone } from '../utils/util';

export const useMoveShape = (setHelpLineVals: Dispatch<SetStateAction<IHelpLineData>>) => {
  const [moveStartInfo, setMoveStartInfo] = useState<IMoveStartInfo>(DEFAULT_MOUSE_INFO);
  const [isMoving, setIsMoving] = useState<boolean>(false);
  const { shapes, setShapes } = useElement();
  const { selectedMap } = useCommon();
  const [localShapes, setLocalShapes] = useState<IShape[]>([]);

  const handleMoveStart = useCallback(
    (info: IMoveStartInfo) => {
      setMoveStartInfo(info);
      setIsMoving(true);
      setLocalShapes(deepClone(shapes));
    },
    [shapes]
  );

  const handleMoveEnd = useCallback(() => {
    setMoveStartInfo(DEFAULT_MOUSE_INFO);
    setIsMoving(false);
    setShapes(deepClone(localShapes));
    setLocalShapes([]);
  }, [localShapes, setShapes]);

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
    [localShapes, moveStartInfo, selectedMap, selectedShapes, setHelpLineVals, shapes]
  );

  return {
    handleMoving,
    isMoving,
    handleMoveStart,
    localShapes,
    handleMoveEnd
  };
};
