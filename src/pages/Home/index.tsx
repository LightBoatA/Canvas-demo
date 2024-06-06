import React, { useCallback, useMemo } from 'react';
import './index.less';
import { useNumber } from '../../hooks/useNumber';

interface IProps {

}
export const Home: React.FC<IProps> = props => {

  const { number, updateNumber } = useNumber();

  const handleClick = useCallback(() => {
    updateNumber(8642);
  }, [updateNumber])

  return useMemo(() => {
    return (
      <div className="page-home">
        <h1>{number}</h1>
        <button onClick={handleClick}>change to 8642</button>
      </div>
    );
  }, [handleClick, number]);
};

export default Home;