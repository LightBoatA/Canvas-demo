import { useState, useEffect } from 'react';

export const useKeyDown = () => {
  const [isSpaceKeyDown, setIsSpaceKeyDown] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsSpaceKeyDown(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        setIsSpaceKeyDown(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return {
    isSpaceKeyDown
  };
};
