import React, { DragEvent, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './index.less';
import { CANVAS_HEITHT, CANVAS_WIDTH, DEFAULT_MOUSE_INFO, IMouseInfo, IPoint, IShape, drawLine, drawShap, getInitShapeData, getMousePos, isPointInShape } from './common';
import { getCryptoUuid } from '../../utils/util';
import { HistoryManager } from './HistoryManager';

interface IProps {

}

const historyManager = new HistoryManager<IShape[]>();

export const Canvas: React.FC<IProps> = props => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    // const canvasWrapRef = useRef<HTMLDivElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const isDownRef = useRef(false);
    const pointsRef = useRef<IPoint[]>([]);
    const beginPointRef = useRef<IPoint | null>(null);
    const [shapes, setShapes] = useState<IShape[]>([]);
    const [selectedId, setSelectedId] = useState<string>("");
    const [mouseInfo, setMouseInfo ] = useState<IMouseInfo>(DEFAULT_MOUSE_INFO);
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
            shapes.forEach(shape => {
                drawShap(ctxRef.current, shape, selectedId);
            })
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

    const handleDragEnter = (e: DragEvent) => {
        console.log('进入目标元素', e.target);
    }

    const handleDragover = (e: DragEvent) => {
        e.preventDefault();
        console.log('拖动中');

    }

    const handleDrop = useCallback((e: any) => {
        const { offsetX, offsetY } = e;
        const { name } = JSON.parse(e.dataTransfer.getData("json"));
        const shape = getInitShapeData(name, offsetX, offsetY);
        setSelectedId(shape.id);
        setShapes(prevShapes => {
            const newShapes = [...prevShapes, shape];
            historyManager.push(newShapes);
            return newShapes;
        })
    }, [])

    const handleMouseDown = useCallback((e: MouseEvent) => {
        const { offsetX, offsetY } = e;
        let hasSelected = false;
        for (let i = shapes.length - 1; i >= 0; i--) {
            if (isPointInShape(offsetX, offsetY, shapes[i])) {
                setSelectedId(shapes[i].id);
                setMouseInfo({
                    isDown: true,
                    mouseOffset: { 
                        x: offsetX - shapes[i].data.x,
                        y: offsetY - shapes[i].data.y,
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

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (mouseInfo?.isDown && selectedId) {
            const { offsetX, offsetY } = e;
            const { x: mouseOffsetx, y: mouseOffsety } = mouseInfo.mouseOffset;
            const newShapes = shapes.map(shape => {
                if (shape.id === selectedId) {
                    return {
                        ...shape,
                        data: {
                            ...shape.data,
                            x: offsetX - mouseOffsetx,
                            y: offsetY - mouseOffsety,
                        }
                    }
                } else  return shape
            })
            setShapes(newShapes);
        }

    }, [mouseInfo?.isDown, mouseInfo.mouseOffset, selectedId, shapes])

    const handleMouseUp = useCallback((e: MouseEvent) => {
        setMouseInfo({
            ...mouseInfo,
            isDown: false,
        });
        historyManager.push(shapes);
    }, [mouseInfo, shapes])

    return useMemo(() => {
        return (
            <div
                className="comp-canvas"
                onDragEnter={handleDragEnter}
                onDragOver={handleDragover}
                onDrop={(e) => handleDrop(e.nativeEvent)}
                onMouseDown={(e) => handleMouseDown(e.nativeEvent)}
                onMouseMove={(e) => handleMouseMove(e.nativeEvent)}
                onMouseUp={(e) => handleMouseUp(e.nativeEvent)}
            >
                <canvas id='drawing' width={CANVAS_WIDTH} height={CANVAS_HEITHT} ref={canvasRef}>这是一个画布</canvas>
            </div>
        );
    }, [handleDrop, handleMouseDown, handleMouseMove, handleMouseUp]);
};

export default Canvas;