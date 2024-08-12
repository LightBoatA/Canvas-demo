import React, { useCallback, useMemo } from 'react';
import './index.less';
import { DRAG_SHAPES, IDragShap } from './common';

interface IProps {
    rootClassName?: string;
}
export const Toolbar: React.FC<IProps> = props => {
    const { rootClassName } = props;
    const handleDragStart = useCallback((e: DragEvent, shape: IDragShap) => {
        e.dataTransfer?.setData("json", JSON.stringify({
            name: shape.name,
        }))
    }, [])
    return useMemo(() => {
        return (
            <div className={`comp-toolbar ${rootClassName || ''}`}>
                <div className="title">
                    形状库
                </div>
                {
                    DRAG_SHAPES.map(shape => {
                        return <div
                            draggable
                            key={shape.name}
                            className={` shape ${shape.class}`}
                            onDragStart={(e) => handleDragStart(e.nativeEvent, shape)}
                        >
                        </div>
                    })
                }
            </div>
        );
    }, [rootClassName, handleDragStart]);
};

export default Toolbar;