import { useCallback, useEffect } from 'react';
import { useElement } from './useElement';
import { useCommon } from './useCommon';

export const useDeleteElement = () => {
  const { shapes, setShapes, connections, setConnections } = useElement();
  const { selectedMap, setSelectedMap } = useCommon();

  const handleDelete = useCallback(() => {
    if (Object.keys(selectedMap).length > 0) {
      setShapes(shapes.filter(shape => !selectedMap[shape.id]));
      setConnections(connections.filter(shape => !selectedMap[shape.id]));
      setSelectedMap({});
    }
  }, [connections, selectedMap, setConnections, setSelectedMap, setShapes, shapes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete') {
        e.preventDefault();
        handleDelete();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleDelete]);

  return {
    handleDelete
  };
};
