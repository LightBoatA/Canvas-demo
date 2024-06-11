import React, { useCallback, useMemo } from 'react';
import './index.less';
import { DRAG_SHAPES, IDragShap } from './common';

interface IProps {

}
export const Toolbar: React.FC<IProps> = props => {

    const handleDragStart = useCallback((e: DragEvent, shape: IDragShap) => {
        console.log("~~~~~~~~~~开始拖拽");
        
        e.dataTransfer?.setData("json", JSON.stringify({
            name: shape.name,
        }))
    }, [])
    return useMemo(() => {
        return (
            <div className="comp-toolbar">
                {
                    DRAG_SHAPES.map(shape => {
                        return <div
                            key={shape.name}
                            className={` shape ${shape.class}`}
                            onDragStart={(e) => handleDragStart(e.nativeEvent, shape)}
                        >
                        </div>
                    })
                }
            </div>
        );
    }, [handleDragStart]);
};

export default Toolbar;