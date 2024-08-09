import { useCallback, useEffect } from 'react';
import { useElement } from './useElement';
import { IHistoryState } from '../utils/type';
import { historyManager } from '../utils/util';


export const useHistory = () => {
  const { setConnections, setShapes } = useElement();

  const pushHistory = useCallback(() => {

  }, [])
  
  const resetStates = useCallback((state: IHistoryState | null) => {
    if (state) {
      const { shapes: historyShapes, connections: historyConnections } = state;
      setShapes(historyShapes);
      setConnections(historyConnections)
    }
  }, [setConnections, setShapes])

  const handleUndo = useCallback(() => {
    const prevState = historyManager.undo();
    resetStates(prevState);
  }, [resetStates]);

  const handleRedo = useCallback(() => {
    const nextState = historyManager.redo();
    resetStates(nextState);
  }, [resetStates]);

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
    // historyPush,
  }
};
