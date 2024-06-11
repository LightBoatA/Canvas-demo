import React, { useMemo } from 'react';
import './index.less';

interface IProps {

}
export const 更换: React.FC<IProps> = props => {

    return useMemo(() => {
        return (
            <div className="更换">
                工具栏
            </div>
        );
    }, []);
};

export default 更换;