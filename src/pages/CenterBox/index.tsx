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
