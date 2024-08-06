import { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import {
  DEFAULT_MOUSE_INFO,
  IHelpLineData,
  IMoveStartInfo,
  IRect,
  getConnectionPointVal,
  getSnapData
} from '../pages/Canvas/common';
import { useShapes } from './useShapes';
import { useCommon } from './useCommon';

export const useMoveShape = (multipleSelectRect: IRect | null, setHelpLineVals: Dispatch<SetStateAction<IHelpLineData>>) => {
  const [moveStartInfo, setMoveStartInfo] = useState<IMoveStartInfo>(DEFAULT_MOUSE_INFO);
  const { shapes, setShapes } = useShapes();
  const { selectedMap } = useCommon();

  const selectedShapes = useMemo(() => {
    if (Object.keys(selectedMap).length <= 0) return [];
    return shapes.filter(shape => selectedMap[shape.id]);
  }, [selectedMap, shapes]);

  const moveShapes = useCallback(
    (newX: number, newY: number) => {
      const { rectOffset, offsetMap } = moveStartInfo;
      if (multipleSelectRect) {
        const { width: rectWidth, height: rectHeight } = multipleSelectRect;
        const newRectX = newX - rectOffset.distanceX,
          newRectY = newY - rectOffset.distanceY;
        const selectedShapeIds = selectedShapes.map(shape => shape.id);
        const { snapX: rectSnapX, snapY: rectSnapY, helpLine } = getSnapData(newRectX, newRectY, rectWidth, rectHeight, selectedShapeIds, shapes);
        setHelpLineVals(helpLine);
        const newShapes = shapes.map(shape => {
          if (selectedMap[shape.id]) {
            const { width, height, id } = shape;
            const distanceData = offsetMap.get(id);
            const distanceX = distanceData?.distanceX || 0;
            const distanceY = distanceData?.distanceY || 0;
            const shapeX = rectSnapX - distanceX,
              shapeY = rectSnapY - distanceY;
            return {
              ...shape,
              x: shapeX,
              y: shapeY,
              connectionPoints: shape.connectionPoints.map(point => getConnectionPointVal(shapeX, shapeY, width, height, point.direction))
            };
          } else return shape;
        });
        setShapes(newShapes);
      }
    },
    [moveStartInfo, multipleSelectRect, selectedMap, selectedShapes, setHelpLineVals, setShapes, shapes]
  );

  return {
    setMoveStartInfo,
    moveShapes
  };
};
