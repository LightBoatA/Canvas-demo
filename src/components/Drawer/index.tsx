import React, { ReactElement, useCallback, useMemo, useState } from 'react';
import './index.less';
import { Button } from 'antd';
import { DoubleRightOutlined, DoubleLeftOutlined } from '@ant-design/icons';

interface IProps {
    children: ReactElement;
    width: number;
    height?: number;
}
export const Drawer: React.FC<IProps> = props => {
    const { children, width = 100, height } = props;
    const [ isShow, setIsShow ] = useState(true);

    const handleArrowClick = useCallback(() => {
        setIsShow(!isShow);
    }, [isShow])

    const style = useMemo(() => {
        return isShow
            ? {} 
            : {
                transform: `translateX(-${width}px)`
            }
    }, [isShow, width])
    return useMemo(() => {
        return (
            <div style={style} className={"comp-drawer"}>
                
                <Button icon={isShow ? <DoubleLeftOutlined /> : <DoubleRightOutlined />} className="drawer-arrow" onClick={handleArrowClick}></Button>
                {children}
            </div>
        );
    }, [children, handleArrowClick, isShow, style]);
};

export default Drawer;