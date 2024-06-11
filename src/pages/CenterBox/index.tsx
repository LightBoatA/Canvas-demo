import React, { useMemo } from 'react';
import './index.less';
import Canvas from '../Canvas';
import Toolbar from '../Toolbar';
import Drawer from '../../components/Drawer';

interface IProps {

}
export const CenterBox: React.FC<IProps> = props => {

    return useMemo(() => {
        return (
            <div className="comp-center">
                {/* <Drawer width={100}> */}
                    <Toolbar />
                {/* </Drawer> */}
                <Canvas />
            </div>
        );
    }, []);
};

export default CenterBox;