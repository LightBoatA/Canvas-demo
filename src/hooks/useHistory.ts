import { useCallback, useEffect } from 'react';
import { HistoryManager } from '../pages/Canvas/common/HistoryManager';
import { IShape } from '../pages/Canvas/common';

const historyManager = new HistoryManager<IShape[]>();
export const useHistory = () => {
  
  const handleUndo = useCallback(() => {
    const prevShapes = historyManager.undo();
    if (prevShapes) {
      // setShapes(prevShapes);
    }
  }, []);

  const handleRedo = useCallback(() => {
    const nextShapes = historyManager.redo();
    if (nextShapes) {
      // setShapes(nextShapes);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        handleUndo();
      } else if (e.ctrlKey && e.key === 'y') {
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  });

  return {

  }
};
