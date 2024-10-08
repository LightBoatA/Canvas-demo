import React, { useMemo } from 'react';
import './index.less';
import Canvas from '../Canvas';
import Toolbar from '../Toolbar';
import PropertyEditor from '../PropertyEditor';

interface IProps {}
export const CenterBox: React.FC<IProps> = props => {
  return useMemo(() => {
    return (
      <div className="comp-center">
        <div className="top-editor">
          <a className='logo' target='_blank' href='https://github.com/LightBoatA?tab=repositories'></a>
          <PropertyEditor />
        </div>
        <div className="left-toolbar">
          <Toolbar />
        </div>
        <div className="center-stage">
          <Canvas />
        </div>
      </div>
    );
  }, []);
};

export default CenterBox;
