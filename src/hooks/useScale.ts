import { useEffect } from 'react';
import { MIN_SCALE, MAX_SCALE } from '../pages/Canvas/common';
import { useCommon } from './useCommon';
import { getCanvasEle } from '../utils/util';

/**
 * 绑定事件
 */
export const useScale = () => {
  const { canvasScale, updateCanvasScale } = useCommon();

  useEffect(() => {
    const canvas = getCanvasEle();
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        let newScale = Number((canvasScale + delta).toFixed(1));
        if (newScale < MIN_SCALE) {
          newScale = MIN_SCALE;
        } else if (newScale > MAX_SCALE) {
          newScale = MAX_SCALE;
        }

        updateCanvasScale(newScale);
      }
    };

    canvas?.addEventListener('wheel', handleWheel, {
      passive: false
    });
    return () => {
      canvas?.removeEventListener('wheel', handleWheel);
    };
  }, [canvasScale, updateCanvasScale]);

  return {};
};
