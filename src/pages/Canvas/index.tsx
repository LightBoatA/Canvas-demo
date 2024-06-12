import React, { ChangeEventHandler, DragEvent, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
import { CANVAS_HEITHT, CANVAS_WIDTH, DEFAULT_MOUSE_INFO, IMouseInfo, INPUT_OFFSET, IPoint, IShape, drawLine, drawShape, getInitShapeData, getMousePos, isPointInShape } from './common';
import { getCryptoUuid } from '../../utils/util';
import { HistoryManager } from './HistoryManager';
import { EShape } from '../Toolbar/common';

interface IProps {

}

const historyManager = new HistoryManager<IShape[]>();

export const Canvas: React.FC<IProps> = props => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    // const canvasWrapRef = useRef<HTMLDivElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDownRef = useRef(false);
    const pointsRef = useRef<IPoint[]>([]);
    const beginPointRef = useRef<IPoint | null>(null);
    const [shapes, setShapes] = useState<IShape[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [hoverId, setHoverId] = useState<string>("");
    const [mouseInfo, setMouseInfo] = useState<IMouseInfo>(DEFAULT_MOUSE_INFO);
    // const [isShowTextInput, setIsShowTextInput] = useState<boolean>(false);
    // const [textPosition, setTextPosition] = useState<IPoint>({ x: 0, y: 0 });
    const [editingText, setEditingText] = useState<string>("");
    const [editingId, setEditingId] = useState<string>("");
    // const [isMouseDown, setIsMouseDown] = useState<boolean>(false);
    // const [mouseOffset, setMouseOffset] = useState<IPoint>({ x: 0, y: 0 });

    // useEffect(() => {
    //     if (canvasRef.current) {
    //         const context = canvasRef.current.getContext('2d')
    //         if (context) {
    //             // 绘制矩形
    //             // context.fillRect(25, 25, 100, 100);
    //             // context.strokeRect(250, 250, 50, 50);

    //             // 画笔初始化
    //             context.lineWidth = 1;
    //             context.strokeStyle = "#000";

    //             const handleMouseDown = (e: MouseEvent) => {
    //                 e.preventDefault();
    //                 const { x, y } = getMousePos(e);
    //                 context.beginPath();
    //                 context.moveTo(x, y);
    //                 isDownRef.current = true;
    //                 pointsRef.current.push({ x, y });
    //                 beginPointRef.current = { x, y };
    //             }

    //             canvasRef.current.addEventListener('mousedown', handleMouseDown)

    //             const handleMouseMove = (e: MouseEvent) => {
    //                 if (!isDownRef.current) return;
    //                 pointsRef.current.push(getMousePos(e))

    //                 if (pointsRef.current.length > 3 && beginPointRef.current) {
    //                     const lastTwoPoints = pointsRef.current.slice(-2);
    //                     const controlPoint = lastTwoPoints[0];
    //                     const endPoint = {
    //                         x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
    //                         y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
    //                     }
    //                     drawLine(context, beginPointRef.current, controlPoint, endPoint)
    //                     beginPointRef.current = endPoint;
    //                 }
    //             }
    //             canvasRef.current.addEventListener('mousemove', handleMouseMove)

    //             canvasRef.current?.addEventListener('mouseup', (e: MouseEvent) => {
    //                 if (!isDownRef.current) return;
    //                 pointsRef.current.push(getMousePos(e));

    //                 if (pointsRef.current.length > 3 && beginPointRef.current) {
    //                     const lastTwoPoints = pointsRef.current.slice(-2);
    //                     const controlPoint = lastTwoPoints[0];
    //                     const endPoint = lastTwoPoints[1];
    //                     drawLine(context, beginPointRef.current, controlPoint, endPoint)
    //                 }
    //                 beginPointRef.current = null;
    //                 isDownRef.current = false;
    //                 pointsRef.current = [];

    //                 canvasRef.current?.addEventListener('mousemove', handleMouseMove);
    //             })
    //         }
    //     }
    //     return () => {
    //     }
    // }, [])

    useEffect(() => {
        if (canvasRef.current && !ctxRef.current) {
            ctxRef.current = canvasRef.current.getContext('2d')
        }
    }, [])

    const clearCanvas = useCallback(() => {
        if (ctxRef.current) {
            ctxRef.current.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEITHT);
        }
    }, [])



    useEffect(() => {
        if (ctxRef.current) {
            clearCanvas();
            drawShape(ctxRef.current, shapes, selectedId);
        }
    }, [clearCanvas, selectedId, shapes])

    const handleUndo = useCallback(() => {
        const prevShapes = historyManager.undo();
        if (prevShapes) {
            setShapes(prevShapes);
        }
    }, [])

    const handleRedo = useCallback(() => {
        const nextShapes = historyManager.redo();
        if (nextShapes) {
            setShapes(nextShapes);
        }
    }, [])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "z") {
                handleUndo();
            } else if (e.ctrlKey && e.key === "y") {
                handleRedo();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    })

    const handleDragover = (e: DragEvent) => {
        e.preventDefault();
    }

    /**
     * @description: 通过拖放位置生成新图形
     * @param {*} name 形状名称
     * @param {*} offsetX 放置位置（鼠标位置） 
     * @param {*} offsetY
     * @return {*} 
     */
    const addShape = useCallback((name: EShape, offsetX: number, offsetY: number) => {
        const shape = getInitShapeData(name, offsetX, offsetY);
        setSelectedId(shape.id);
        setShapes(prevShapes => {
            const newShapes = [...prevShapes, shape];
            historyManager.push(newShapes);
            return newShapes;
        })
    }, [])


    const handleDrop = useCallback((e: any) => {
        const { offsetX, offsetY } = e;
        const { name } = JSON.parse(e.dataTransfer.getData("json"));
        addShape(name, offsetX, offsetY)
    }, [addShape])

    const selectShape = useCallback((offsetX: number, offsetY: number) => {
        let hasSelected = false;
        for (let i = shapes.length - 1; i >= 0; i--) {
            if (isPointInShape(offsetX, offsetY, shapes[i])) {
                setSelectedId(shapes[i].id);
                setMouseInfo({
                    isDown: true,
                    mouseOffset: {
                        x: offsetX - shapes[i].x,
                        y: offsetY - shapes[i].y,
                    }
                })
                hasSelected = true;
                break;
            }
        }
        if (!hasSelected) {
            setSelectedId("");
        }
    }, [shapes])

    // const hoverShape = useCallback((offsetX: number, offsetY: number) => {
    //     for (let i = shapes.length - 1; i >= 0; i--) {
    //         if (isPointInShape(offsetX, offsetY, shapes[i])) {
                
    //         }
    //     }
    // }, [])


    const handleMouseDown = useCallback((e: MouseEvent) => {
        const { offsetX, offsetY } = e;
        if (e.target === inputRef.current) return;
        selectShape(offsetX, offsetY);
    }, [selectShape])

    const updateShapeText = useCallback((id: string, newText: string) => {
        setShapes(prevShapes => {
            return prevShapes.map(shape => {
                if (shape.id === id) {
                    return {
                        ...shape,
                        text: newText, // 更新文字
                    }
                } else return shape;
            })
        })
    }, [])
    /**
     * @description: 在鼠标双击位置开启文字编辑
     * @param {*} useCallback
     * @return {*}
     */
    const startEditing = useCallback((x: number, y: number) => {
        const clickedShape = shapes.find(shape => isPointInShape(x, y, shape));
        if (clickedShape) {
            setSelectedId(clickedShape.id);
            setEditingId(clickedShape.id);
            setEditingText(clickedShape.text);
            updateShapeText(clickedShape.id, "");
        }
    }, [shapes, updateShapeText])

    useEffect(() => {
        if (editingId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingId])

    const handleDoubleClick = useCallback((e: MouseEvent) => {
        const { offsetX, offsetY } = e;
        startEditing(offsetX, offsetY);
    }, [startEditing])

    const aaa = useCallback(() => { }, [])

    const updateShapesPosition = useCallback((newX: number, newY: number) => {
        const { x: mouseOffsetx, y: mouseOffsety } = mouseInfo.mouseOffset;
        const newShapes = shapes.map(shape => {
            if (shape.id === selectedId) {
                return {
                    ...shape,
                    x: newX - mouseOffsetx,
                    y: newY - mouseOffsety,
                }
            } else return shape
        })
        setShapes(newShapes);
    }, [mouseInfo.mouseOffset, selectedId, shapes])


    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (mouseInfo?.isDown && selectedId) {
            const { offsetX, offsetY } = e;
            updateShapesPosition(offsetX, offsetY);
        }
    }, [mouseInfo?.isDown, selectedId, updateShapesPosition])

    const handleMouseUp = useCallback((e: MouseEvent) => {
        setMouseInfo({
            ...mouseInfo,
            isDown: false,
        });
        historyManager.push(shapes);
    }, [mouseInfo, shapes])

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingText(e.target.value);
    }, [])

    const handleTextSubmit = useCallback(() => {
        updateShapeText(editingId, editingText);
        setEditingText("");
        setEditingId("");
    }, [editingId, editingText, updateShapeText])

    const inputStyle = useMemo(() => {
        const editingShape = shapes.find(shape => shape.id === editingId);
        let style: { [key: string]: any } = {
            position: 'absolute',
        }
        if (editingShape) {
            style = {
                ...style,
                left: editingShape.x - INPUT_OFFSET.x,
                top: editingShape.y - INPUT_OFFSET.y,
                width: `${100}px`,
                // height: `${100}px`,
            }
        }
        return style;
    }, [editingId, shapes])

    return useMemo(() => {
        return (
            <div
                className="comp-canvas"
                onDragOver={handleDragover}
                onDrop={(e) => handleDrop(e.nativeEvent)}
                onMouseDown={(e) => handleMouseDown(e.nativeEvent)}
                onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
                onMouseUp={(e) => handleMouseUp(e.nativeEvent)}
                onDoubleClick={(e) => handleDoubleClick(e.nativeEvent)}
            >
                <canvas id='drawing' width={CANVAS_WIDTH} height={CANVAS_HEITHT} ref={canvasRef}>这是一个画布</canvas>
                {editingId && <input
                    style={inputStyle}
                    className='input-text'
                    ref={inputRef}
                    value={editingText}
                    type='text'
                    onChange={handleTextChange}
                    onBlur={handleTextSubmit}
                />}
            </div>
        );
    }, [editingId, editingText, handleDoubleClick, handleDrop, handleMouseDown, handleMouseMove, handleMouseUp, handleTextChange, handleTextSubmit, inputStyle]);
};

export default Canvas;