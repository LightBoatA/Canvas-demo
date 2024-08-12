import React, { useMemo } from 'react';
import './index.less';
import CenterBox from '../CenterBox';

interface IProps {

}
export const Index: React.FC<IProps> = props => {
  return useMemo(() => {
    return (
      <div className="page">
        <CenterBox/>
      </div>
    );
  }, []);

};

export default Index;