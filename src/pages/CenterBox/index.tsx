import React, { useMemo } from 'react';
import './index.less';
import Canvas from '../Canvas';
import Toolbar from '../Toolbar';
import Drawer from '../../components/Drawer';
import PropertyEditor from '../PropertyEditor';

interface IProps {}
export const CenterBox: React.FC<IProps> = props => {
  return useMemo(() => {
    return (
      <div className="comp-center">
        {/* <Drawer width={100}> */}
        <Toolbar />
        {/* </Drawer> */}
        <div className="right-editor">
          <PropertyEditor />
          <Canvas />
        </div>
      </div>
    );
  }, []);
};

export default CenterBox;
