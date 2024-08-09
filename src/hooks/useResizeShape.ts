import { Dispatch, SetStateAction, useCallback, useState } from 'react';
import { IResizeStartInfo, IShape, calcResizedShape } from '../pages/Canvas/common';
import { useElement } from './useElement';
import { deepClone } from '../utils/util';

export const useResizeShape = (
  localShapes: IShape[],
  setLocalShapes: Dispatch<SetStateAction<IShape[]>>,
  setIsFrequentlyUpdating: Dispatch<SetStateAction<boolean>>
) => {
  // 缩放开始信息
  const [resizeStartInfo, setResizeStartInfo] = useState<IResizeStartInfo | null>(null);
  const { shapes, setShapes } = useElement();

  const handleResizeStart = useCallback((info: IResizeStartInfo | null) => {
    info && setResizeStartInfo(info);
    setIsFrequentlyUpdating(true);
    setLocalShapes(deepClone(shapes));

  }, [setIsFrequentlyUpdating, setLocalShapes, shapes]);

  const handleResizing = useCallback(
    (cursorX: number, cursorY: number) => {
      if (resizeStartInfo) {
        const map = calcResizedShape(cursorX, cursorY, resizeStartInfo);
        const newShapes = localShapes.map(shape => (map.has(shape.id) ? map.get(shape.id)! : shape));
        setLocalShapes(newShapes);
      }
    },
    [localShapes, resizeStartInfo, setLocalShapes]
  );

  const handleResizeEnd = useCallback(() => {
    setResizeStartInfo(null);
    setIsFrequentlyUpdating(false);
    setShapes(deepClone(localShapes));
    setLocalShapes([]);
  }, [localShapes, setIsFrequentlyUpdating, setLocalShapes, setShapes]);

  return {
    handleResizeStart,
    handleResizing,
    handleResizeEnd
  };
};
