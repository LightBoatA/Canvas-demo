import { useState, useCallback } from 'react';
import { IPoint, DEFAULT_POINT } from '../pages/Canvas/common';
import { useCommon } from './useCommon';

export const useMoveStage = () => {
  const { updateCanvasPosition, canvasPosition } = useCommon();

  const [canvasStartOffset, setCanvasStartOffset] = useState<IPoint>(DEFAULT_POINT);
  const handleStageMoving = useCallback(
    (offsetX: number, offsetY: number) => {
      const { x, y } = canvasStartOffset;
      const DValueX = offsetX - x;
      const DValueY = offsetY - y;
      updateCanvasPosition([canvasPosition[0] + DValueX, canvasPosition[1] + DValueY]);
    },
    [canvasPosition, canvasStartOffset, updateCanvasPosition]
  );
  const handleStageMoveStart = useCallback((startPoint: IPoint) => {
    setCanvasStartOffset(startPoint);
  }, []);

  return {
    handleStageMoveStart,
    handleStageMoving,
  }
};
