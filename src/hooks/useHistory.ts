import { useCallback, useEffect } from 'react';
import { HistoryManager } from '../pages/Canvas/common/HistoryManager';
import { IConnection, IShape } from '../pages/Canvas/common';
import { useShapes } from './useShapes';
import { useConnections } from './useConnections';
import { IHistoryState } from '../utils/type';
import { historyManager } from '../utils/util';


export const useHistory = () => {
  const { shapes, setShapes } = useShapes();
  const { connections, setConnections } = useConnections();

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

  // const historyPush = useCallback(() => {
  //   historyManager.push({
  //     shapes,
  //     connections
  //   })
  // }, [connections, shapes]);

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
