import React, { CSSProperties, DragEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
import { CANVAS_HEITHT, CANVAS_WIDTH, DEFAULT_HELP_LINE_VAL, DEFAULT_MOUSE_INFO, EElement, EMouseMoveMode, IConnection, IConnectionPoint, ICtrlPoint, IHelpLineData, IMouseMoveInfo, INPUT_OFFSET, IShape, IShapeConnectionPoint, calcMultipleSelectRect, calcResizedShape, connectionRouteCache, cursorDirectionMap, drawShape, getConnectionPointVal, getCtrlPoints, getInitShapeData, getIntersectedConnectionId, getIntersectedConnectionPoint, getIntersectedControlPoint, getIntersectedShape, calcMouseMoveInfo, getRectBounds, getShapeById, getSnapData, getVirtualEndPoint, isPointInLine, isPointInShape, getMouseMoveInfo } from './common/index';
import { HistoryManager } from './common/HistoryManager';
import { EShape } from '../Toolbar/common';
import { getCryptoUuid } from '../../utils/util';
import { Button, Typography } from 'antd';
import ContextMenuModal from '../../components/ContextMenuModal';

interface IProps {

}

const historyManager = new HistoryManager<IShape[]>();

export const Canvas: React.FC<IProps> = props => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const [shapes, setShapes] = useState<IShape[]>([]);
    // 选中的元素
    const [selectedMap, setSelectedMap] = useState<Map<string, EElement>>(new Map());
    const [mouseMoveInfo, setMouseMoveInfo] = useState<IMouseMoveInfo>(DEFAULT_MOUSE_INFO);
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
    const [hoveringConnectionId, setHoveringConnectionId] = useState<string>("");
    const [helpLineVals, setHelpLineVals] = useState<IHelpLineData>(DEFAULT_HELP_LINE_VAL);
    const [isShowContextMenu, setIsShowContextMenu] = useState<boolean>(false);
    const [contextMenuModalStyle, setContextMenuModalStyle] = useState<CSSProperties>({ top: 0, left: 0, margin: 0 });
    const [mode, setMode] = useState<EMouseMoveMode>(EMouseMoveMode.DEFAULT);

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

    const selectedShapes = useMemo(() => {
        if (selectedMap.size <= 0) return [];
        return shapes.filter(shape => selectedMap.has(shape.id));
    }, [selectedMap, shapes])


    const multipleSelectRect = useMemo(() => {
        return calcMultipleSelectRect(selectedMap, connections, selectedShapes);
    }, [connections, selectedMap, selectedShapes])

    useEffect(() => {
        if (ctxRef.current) {
            clearCanvas();
            drawShape(
                ctxRef.current,
                shapes,
                hoveringId,
                hoveringConnectionId,
                preparedConnection,
                connections,
                hoveringConnectionPoint,
                helpLineVals,
                multipleSelectRect,
            );
        }
    }, [clearCanvas, connections, helpLineVals, hoveringConnectionId, hoveringConnectionPoint, hoveringId, multipleSelectRect, preparedConnection, selectedMap, shapes])

    const handleContextMenu = useCallback((e: MouseEvent) => {
        e.preventDefault();
        const { clientX, clientY } = e;
        setIsShowContextMenu(true);
        setContextMenuModalStyle({
            top: clientY,
            left: clientX,
            margin: 0
        });
    }, [])


    useEffect(() => {
        document.addEventListener("contextmenu", handleContextMenu);

        return () => {
            document.removeEventListener("contextmenu", handleContextMenu);
        }
    }, [handleContextMenu])

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
        setSelectedMap(new Map([[shape.id, EElement.SHAPE]]));
        setShapes(prevShapes => {
            const newShapes = [...prevShapes, shape];
            historyManager.push(newShapes);
            return newShapes;
        })
    }, [])

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
            setSelectedMap(new Map([[clickedShape.id, EElement.SHAPE]]));
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

    const handleDelete = useCallback(() => {
        if (selectedMap.size > 0) {
            setShapes(oldShape => oldShape.filter(shape => !selectedMap.has(shape.id)));
            setConnections(oldConnection => oldConnection.filter(shape => !selectedMap.has(shape.id)));
            setSelectedMap(new Map());
        }
    }, [selectedMap])

    const updateElementsPosition = useCallback((newX: number, newY: number) => {
        const { rectOffset, offsetMap } = mouseMoveInfo;
        if (multipleSelectRect) {
            const { width: rectWidth, height: rectHeight } = multipleSelectRect;
            const newRectX = newX - rectOffset.distanceX, newRectY = newY - rectOffset.distanceY;
            const selectedShapeIds = selectedShapes.map(shape => shape.id);
            const { snapX: rectSnapX, snapY: rectSnapY, helpLine } = getSnapData(newRectX, newRectY, rectWidth, rectHeight, selectedShapeIds, shapes);
            setHelpLineVals(helpLine);
            const newShapes = shapes.map(shape => {
                if (selectedMap.has(shape.id)) {
                    const { width, height, id } = shape;
                    const distanceData = offsetMap.get(id);
                    const distanceX = distanceData?.distanceX || 0;
                    const distanceY = distanceData?.distanceY || 0;
                    const shapeX = rectSnapX - distanceX, shapeY = rectSnapY - distanceY;
                    return {
                        ...shape,
                        x: shapeX,
                        y: shapeY,
                        connectionPoints: shape.connectionPoints.map(point => getConnectionPointVal(shapeX, shapeY, width, height, point.direction))
                    }
                } else return shape
            })
            setShapes(newShapes);
        }

    }, [mouseMoveInfo, multipleSelectRect, selectedMap, selectedShapes, shapes])

    // const updateShapeSize = useCallback((cursorX: number, cursorY: number) => {
    //     if (hoveringCtrlPoint) {
    //         setShapes(prevShapes => {
    //             return prevShapes.map(shape => {
    //                 if (shape.id === selectedId) {
    //                     const newShape = calcResizedShape(cursorX, cursorY, shape, hoveringCtrlPoint);
    //                     return newShape;
    //                 } else return shape
    //             })
    //         });
    //     }
    // }, [hoveringCtrlPoint, selectedId])


    // const ctrlPoints = useMemo(() => {
    //     if (!selectedId) return null;
    //     const shape = getShapeById(shapes, selectedId);
    //     if (shape) {
    //         return getCtrlPoints(shape);
    //     }
    //     return null;

    // }, [selectedId, shapes])

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


    const drawVirtualConnection = useCallback((offsetX: number, offsetY: number) => {
        // 从连接点到鼠标移动位置画虚线
        if (startConnectionPoint) {
            const { shape, point } = startConnectionPoint;
            const { x: fromX, y: fromY } = point;
            let toShape: IShape, toPoint: IConnectionPoint;
            // 鼠标移到了目标连接点上
            if (hoveringConnectionPoint) {
                toShape = hoveringConnectionPoint.shape;
                toPoint = hoveringConnectionPoint.point;
            } else {
                // 鼠标移到的地方没有形状及连接点
                const endPoint = getVirtualEndPoint(offsetX, offsetY, fromX, fromY);
                toShape = endPoint.shape;
                toPoint = endPoint.point;
            }

            setPreparedConnection({
                id: 'prepared-connection',
                fromShape: shape,
                fromPoint: point,
                toPoint,
                toShape,
            })
        }
    }, [hoveringConnectionPoint, startConnectionPoint])

    // const handleClick = useCallback((e: MouseEvent) => {

    // }, [])

    const handleMouseDown = useCallback((e: MouseEvent) => {
        const { offsetX, offsetY, ctrlKey } = e;
        if (e.target === inputRef.current) return;
        // 与光标相交的连接点
        const intersectedConnectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
        // 与光标相交的形状
        const intersectedShape = getIntersectedShape(shapes, offsetX, offsetY); // TODO: 这里一定要先计算出来吗？
        // 与光标相交的连接线
        const intersectConnectionId = getIntersectedConnectionId(offsetX, offsetY, connections);

        if (intersectedConnectionPoint) {
            // 与连接点相交：画线
            setMode(EMouseMoveMode.CONNECT);
            setStartConnectionPoint(intersectedConnectionPoint);
        } else if (intersectedShape || intersectConnectionId) {
            // 与图形、连线相交：选择
            let newMap = new Map(selectedMap);
            const id = intersectedShape?.id || intersectConnectionId; // 同时只可能选中一种元素
            if (ctrlKey) {
                // 加选、减选
                if (selectedMap.has(id)) {
                    newMap.delete(id);
                } else {
                    const type = intersectedShape?.id ? EElement.SHAPE : EElement.CONNECTION;
                    newMap.set(id, type)
                }
            } else {
                // 单选
                if (intersectedShape) {
                    // 单选形状
                    const isPointInSelectedShape = selectedShapes.find(shape => shape.id === intersectedShape?.id);
                    let newSelectedShapes = selectedShapes;

                    // 如果点击的是选框外的图形，重新设置选框内容
                    if (!isPointInSelectedShape) {
                        newSelectedShapes = [intersectedShape];
                        newMap = new Map([[intersectedShape.id, EElement.SHAPE]]);
                    }
                    const newMouseMoveInfo = getMouseMoveInfo(newMap, connections, newSelectedShapes, offsetX, offsetY);
                    setMode(EMouseMoveMode.MOVE);
                    setMouseMoveInfo(newMouseMoveInfo);
                } else if (intersectConnectionId) {
                    // 单选连线
                    newMap = new Map([[intersectConnectionId, EElement.CONNECTION]]);
                }
            }
            setSelectedMap(newMap);
        } else {
            // 不与任何元素相交
            setMode(EMouseMoveMode.DEFAULT);
            setSelectedMap(new Map());
        }
    }, [connections, selectedMap, selectedShapes, shapes])


    const handleMouseMove = useCallback((e: MouseEvent) => {
        const { offsetX, offsetY } = e;
        const [hoveringShape] = shapes.filter(shape => isPointInShape(offsetX, offsetY, shape));
        const [hoveringConnection] = connections.filter(connection => isPointInLine(offsetX, offsetY, connection.id));
        // 设置悬停连接线
        hoveringConnection ? setHoveringConnectionId(hoveringConnection.id) : setHoveringConnectionId("");
        // 设置悬停形状
        hoveringShape ? setHoveringId(hoveringShape.id) : setHoveringId("");
        // 设置悬停缩放控制点
        // if (selectedId) {
        //     const shape = getShapeById(shapes, selectedId);
        //     if (shape && ctrlPoints) {
        //         const ctrlPoint = getIntersectedControlPoint(offsetX, offsetY, shape, ctrlPoints);
        //         setHoveringCtrlPoint(ctrlPoint)
        //     }
        // }
        // 设置悬停连接点
        const connectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
        connectionPoint ? setHoveringConnectionPoint(connectionPoint) : setHoveringConnectionPoint(null);
        // 移动或缩放
        // if (mouseMoveInfo?.isDown && selectedId) {
        //     if (hoveringCtrlPoint) {
        //         updateShapeSize(offsetX, offsetY);
        //     } else {
        //         updateShapesPosition(offsetX, offsetY);
        //     }
        // }
        switch (mode) {
            case EMouseMoveMode.MOVE:
                updateElementsPosition(offsetX, offsetY);
                break;
            case EMouseMoveMode.RESIZE:
                break;
            case EMouseMoveMode.CONNECT:
                drawVirtualConnection(offsetX, offsetY);
                break;
            case EMouseMoveMode.BOX_SELECTION:
                break;
            default:
                break;
        }
    }, [connections, drawVirtualConnection, mode, shapes, updateElementsPosition])

    const handleMouseUp = useCallback((e: MouseEvent) => {
        setMode(EMouseMoveMode.DEFAULT);
        const { offsetX, offsetY } = e;
        const connectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
        if (connectionPoint && startConnectionPoint) {
            const { shape, point } = startConnectionPoint;
            setConnections(prevConnections => {
                return [
                    ...prevConnections,
                    {
                        id: getCryptoUuid(),
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
    }, [shapes, startConnectionPoint])

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
        console.log('选中的图形：', Array.from(selectedMap));

        return (
            <div className="comp-canvas">
                <canvas
                    onDragOver={handleDragover}
                    onDrop={(e) => handleDrop(e.nativeEvent)}
                    onMouseDown={(e) => handleMouseDown(e.nativeEvent)}
                    onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
                    onMouseUp={(e) => handleMouseUp(e.nativeEvent)}
                    onDoubleClick={(e) => handleDoubleClick(e.nativeEvent)}
                    // onClick={(e) => handleClick(e.nativeEvent)}
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
                <ContextMenuModal
                    open={isShowContextMenu}
                    style={contextMenuModalStyle}
                    onCancel={() => {
                        setIsShowContextMenu(false);
                    }}>
                    <div>
                        <Typography.Link className="w100p" onClick={handleDelete}>
                            <div className="context-menu-item">
                                <span>删除</span>
                                <span className="key">Delete</span>
                            </div>
                        </Typography.Link>
                    </div>
                </ContextMenuModal>
            </div>
        );
    }, [contextMenuModalStyle, editingId, editingText, handleDelete, handleDoubleClick, handleDrop, handleMouseDown, handleMouseMove, handleMouseUp, handleTextChange, handleTextSubmit, inputStyle, isShowContextMenu, selectedMap]);
};

export default Canvas;