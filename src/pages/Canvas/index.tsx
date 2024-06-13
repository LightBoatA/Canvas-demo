import React, { ChangeEventHandler, DragEvent, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
import { CANVAS_HEITHT, CANVAS_WIDTH, DEFAULT_MOUSE_INFO, EDirection, ICtrlPoint, IMouseInfo, INPUT_OFFSET, IPoint, IShape, calcResizedShape, cursorDirectionMap, drawGrid, drawLine, drawShape, getCtrlPoints, getInitShapeData, getIntersectedControlPoint, getMousePos, getShapeById, isPointInShape } from './common';
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
    const [mouseInfo, setMouseInfo] = useState<IMouseInfo>(DEFAULT_MOUSE_INFO);
    // const [isShowTextInput, setIsShowTextInput] = useState<boolean>(false);
    // const [textPosition, setTextPosition] = useState<IPoint>({ x: 0, y: 0 });
    const [editingText, setEditingText] = useState<string>("");
    const [editingId, setEditingId] = useState<string>("");
    // 鼠标悬停在缩放控制点上
    const [hoveringCtrlPoint, setHoveringCtrlPoint] = useState<ICtrlPoint | null>(null);
    // 鼠标悬停在形状上
    const [hoveringId, setHoveringId] = useState<string>("");
    const [isResizing, setIsResizing] = useState<boolean>(false);

    useEffect(() => {
        if (canvasRef.current && !ctxRef.current) {
            ctxRef.current = canvasRef.current.getContext('2d')
        }
    }, [])

    useEffect(() => {
        // ctxRef.current && drawGrid(ctxRef.current);
    }, [])
    // 鼠标移动到缩放点时，光标样式修改
    useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.style.cursor = hoveringCtrlPoint ?
                `${cursorDirectionMap[hoveringCtrlPoint.direction]}`
                : `default`;
        }
    }, [hoveringCtrlPoint])

    const clearCanvas = useCallback(() => {
        if (ctxRef.current) {
            ctxRef.current.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEITHT);
        }
    }, [])

    useEffect(() => {
        if (ctxRef.current) {
            clearCanvas();
            drawGrid(ctxRef.current);
            drawShape(ctxRef.current, shapes, selectedId, hoveringId);
        }
    }, [clearCanvas, hoveringId, selectedId, shapes])

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

    const addShape = useCallback((name: EShape, offsetX: number, offsetY: number) => {
        const shape = getInitShapeData(name, offsetX, offsetY);
        setSelectedId(shape.id);
        setShapes(prevShapes => {
            const newShapes = [...prevShapes, shape];
            historyManager.push(newShapes);
            return newShapes;
        })
    }, [])

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

    const updateShapeSize = useCallback((cursorX: number, cursorY: number) => {
        if (hoveringCtrlPoint) {
            setShapes(prevShapes => {
                return prevShapes.map(shape => {
                    if (shape.id === selectedId) {
                        const newShape = calcResizedShape(cursorX, cursorY, shape, hoveringCtrlPoint);
                        return newShape;
                    } else return shape
                })
            });
        }
    }, [hoveringCtrlPoint, selectedId])


    const ctrlPoints = useMemo(() => {
        if (!selectedId) return null;
        const shape = getShapeById(shapes, selectedId);
        if (shape) {
            return getCtrlPoints(shape);
        }
        return null;

    }, [selectedId, shapes])

    const handleDragover = (e: DragEvent) => {
        e.preventDefault();
    }

    const handleDrop = useCallback((e: any) => {
        const { offsetX, offsetY } = e;
        const { name } = JSON.parse(e.dataTransfer.getData("json"));
        addShape(name, offsetX, offsetY)
    }, [addShape])

    const handleDoubleClick = useCallback((e: MouseEvent) => {
        const { offsetX, offsetY } = e;
        startEditing(offsetX, offsetY);
    }, [startEditing])

    const handleMouseDown = useCallback((e: MouseEvent) => {
        const { offsetX, offsetY } = e;
        if (e.target === inputRef.current) return;
        selectShape(offsetX, offsetY);
    }, [selectShape])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const { offsetX, offsetY } = e;
        const [hoveringShape] = shapes.filter(shape => isPointInShape(offsetX, offsetY, shape));
        hoveringShape ? setHoveringId(hoveringShape.id) : setHoveringId("");
        // 设置鼠标悬停的控制点
        if (selectedId) {
            const shape = getShapeById(shapes, selectedId);
            if (shape && ctrlPoints) {
                const ctrlPoint = getIntersectedControlPoint(offsetX, offsetY, shape, ctrlPoints);
                setHoveringCtrlPoint(ctrlPoint)
            }
        }
        if (mouseInfo?.isDown && selectedId) {
            if (hoveringCtrlPoint) {
                updateShapeSize(offsetX, offsetY);
            } else {
                updateShapesPosition(offsetX, offsetY);
            }
            // const { offsetX, offsetY } = e;
        }
    }, [ctrlPoints, hoveringCtrlPoint, mouseInfo?.isDown, selectedId, shapes, updateShapeSize, updateShapesPosition])

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
                width: `${editingShape.width}px`,
            }
        }
        return style;
    }, [editingId, shapes])

    return useMemo(() => {
        return (
            <div className="comp-canvas">
                <canvas
                    onDragOver={handleDragover}
                    onDrop={(e) => handleDrop(e.nativeEvent)}
                    onMouseDown={(e) => handleMouseDown(e.nativeEvent)}
                    onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
                    onMouseUp={(e) => handleMouseUp(e.nativeEvent)}
                    onDoubleClick={(e) => handleDoubleClick(e.nativeEvent)}
                    id='drawing'
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEITHT}
                    ref={canvasRef}>
                    这是一个画布
                </canvas>
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