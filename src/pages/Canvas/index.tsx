import React, { DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
import { CANVAS_HEITHT, CANVAS_WIDTH, DEFAULT_HELP_LINE_VAL, DEFAULT_MOUSE_INFO, IConnection, IConnectionPoint, ICtrlPoint, IHelpLineData, IMouseInfo, INPUT_OFFSET, IShape, IShapeConnectionPoint, calcResizedShape, cursorDirectionMap, drawShape, getConnectionPointVal, getCtrlPoints, getInitShapeData, getIntersectedConnectionPoint, getIntersectedControlPoint, getShapeById, getSnapData, getVirtualEndPoint, isPointInShape } from './common/index';
import { HistoryManager } from './common/HistoryManager';
import { EShape } from '../Toolbar/common';

interface IProps {

}

const historyManager = new HistoryManager<IShape[]>();

export const Canvas: React.FC<IProps> = props => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [shapes, setShapes] = useState<IShape[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [mouseInfo, setMouseInfo] = useState<IMouseInfo>(DEFAULT_MOUSE_INFO);
    const [editingText, setEditingText] = useState<string>("");
    const [editingId, setEditingId] = useState<string>("");
    // 鼠标悬停在缩放控制点上
    const [hoveringCtrlPoint, setHoveringCtrlPoint] = useState<ICtrlPoint | null>(null);
    // 鼠标悬停在形状上
    const [hoveringId, setHoveringId] = useState<string>("");
    // const [fromConnectionPointInfo, setfromConnectionPointInfo] = useState<string>(""); // shapeId-connectionPointDirection
    const [startConnectionPoint, setStartConnectionPoint] = useState<IShapeConnectionPoint | null>(null);
    const [preparedConnection, setPreparedConnection] = useState<IConnection | null>(null);
    const [connections, setConnections] = useState<IConnection[]>([]);
    const [hoveringConnectionPoint, setHoveringConnectionPoint] = useState<IShapeConnectionPoint | null>(null);
    const [helpLineVals, setHelpLineVals] = useState<IHelpLineData>(DEFAULT_HELP_LINE_VAL);

    useEffect(() => {
        if (canvasRef.current && !ctxRef.current) {
            ctxRef.current = canvasRef.current.getContext('2d')
        }
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
            drawShape(
                ctxRef.current,
                shapes,
                selectedId,
                hoveringId,
                preparedConnection,
                connections,
                hoveringConnectionPoint,
                helpLineVals,
            );
        }
    }, [clearCanvas, connections, helpLineVals, hoveringConnectionPoint, hoveringId, preparedConnection, selectedId, shapes])

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
                const { width, height, id } = shape;
                const shapeX = newX - mouseOffsetx, shapeY = newY - mouseOffsety;
                const { snapX, snapY, helpLine } = getSnapData(shapeX, shapeY, width, height, id, shapes);
                setHelpLineVals(helpLine);
                return {
                    ...shape,
                    x: snapX,
                    y: snapY,
                    connectionPoints: shape.connectionPoints.map(point => getConnectionPointVal(snapX, snapY, width, height, point.direction))
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
        const connectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
        if (connectionPoint) {
            setStartConnectionPoint(connectionPoint);
        } else {
            selectShape(offsetX, offsetY);

        }
    }, [selectShape, shapes])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const { offsetX, offsetY } = e;
        const [hoveringShape] = shapes.filter(shape => isPointInShape(offsetX, offsetY, shape));
        (hoveringShape && hoveringShape.id !== selectedId) ? setHoveringId(hoveringShape.id) : setHoveringId("");
        // 设置鼠标悬停的控制点
        if (selectedId) {
            const shape = getShapeById(shapes, selectedId);
            if (shape && ctrlPoints) {
                const ctrlPoint = getIntersectedControlPoint(offsetX, offsetY, shape, ctrlPoints);
                setHoveringCtrlPoint(ctrlPoint)
            }
        }
        // 移动或缩放
        if (mouseInfo?.isDown && selectedId) {
            if (hoveringCtrlPoint) {
                updateShapeSize(offsetX, offsetY);
            } else {
                updateShapesPosition(offsetX, offsetY);
            }
        }

        // hover连接点
        const connectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
        if (connectionPoint) {
            setHoveringConnectionPoint(connectionPoint);
        } else {
            setHoveringConnectionPoint(null);
        }

        // 从连接点到鼠标移动位置画虚线
        if (startConnectionPoint) {
            const { shape, point } = startConnectionPoint;
            const { x: fromX, y: fromY } = point;
            let toShape: IShape, toPoint: IConnectionPoint;
            // 鼠标移到了目标连接点上
            if (connectionPoint) {
                toShape = connectionPoint.shape;
                toPoint = connectionPoint.point;
            } else {
                // 鼠标移到的地方没有形状及连接点
                const endPoint = getVirtualEndPoint(offsetX, offsetY, fromX, fromY);
                toShape = endPoint.shape;
                toPoint = endPoint.point;
            }

            setPreparedConnection({
                fromShape: shape,
                fromPoint: point,
                toPoint,
                toShape,
            })
        }

    }, [ctrlPoints, hoveringCtrlPoint, mouseInfo?.isDown, selectedId, shapes, startConnectionPoint, updateShapeSize, updateShapesPosition])

    const handleMouseUp = useCallback((e: MouseEvent) => {
        setMouseInfo({
            ...mouseInfo,
            isDown: false,
        });
        const { offsetX, offsetY } = e;
        const connectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
        if (connectionPoint && startConnectionPoint) {
            const { shape, point } = startConnectionPoint;
            setConnections(prevConnections => {
                return [
                    ...prevConnections,
                    {
                        fromShape: shape,
                        fromPoint: point,
                        toShape: connectionPoint.shape,
                        toPoint: connectionPoint.point,
                    }
                ]
            })
        }
        setStartConnectionPoint(null);
        setPreparedConnection(null);
        setHelpLineVals(DEFAULT_HELP_LINE_VAL)
        historyManager.push(shapes);
    }, [mouseInfo, shapes, startConnectionPoint])

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
                // left: editingShape.x - INPUT_OFFSET.x,
                left: "50%",
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