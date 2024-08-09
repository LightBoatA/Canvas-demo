import { useCallback, useEffect } from 'react';
import { getInitShapeData, EElement } from '../pages/Canvas/common';
import { EShape } from '../pages/Toolbar/common';
import { useElement } from './useElement';
import { useCommon } from './useCommon';
import { getCanvasEle } from '../utils/util';

export const useDrop = () => {
  const { shapes, setShapes } = useElement();
  const { setSelectedMap, canvasScale } = useCommon();
  const addShape = useCallback(
    (name: EShape, offsetX: number, offsetY: number) => {
      const shape = getInitShapeData(name, offsetX, offsetY);
      setSelectedMap({ [shape.id]: EElement.SHAPE });

      setShapes([...shapes, shape]);
    },
    [setSelectedMap, setShapes, shapes]
  );
  
  useEffect(() => {
    const handleDragover = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: any) => {
      const { offsetX, offsetY } = e;
      const { name } = JSON.parse(e.dataTransfer.getData('json'));

      addShape(name, offsetX / canvasScale, offsetY / canvasScale);
    };

    const canvas = getCanvasEle();
    canvas?.addEventListener('dragover', handleDragover);
    canvas?.addEventListener('drop', handleDrop);

    return () => {
      canvas?.removeEventListener('dragover', handleDragover);
      canvas?.removeEventListener('drop', handleDrop);
    };
  }, [addShape, canvasScale]);
};
