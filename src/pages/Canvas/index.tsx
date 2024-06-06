import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import './index.less';
import { IPoint, drawLine, getMousePos } from './common';

interface IProps {

}
export const Canvas: React.FC<IProps> = props => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDownRef = useRef(false);
    const pointsRef = useRef<IPoint[]>([]);
    const beginPointRef = useRef<IPoint | null>(null);
    useEffect(() => {
        if (canvasRef.current) {
            const context = canvasRef.current.getContext('2d')
            if (context) {
                // 初始化
                context.lineWidth = 1;
                context.strokeStyle = "#000";

                const handleMouseDown = (e: MouseEvent) => {
                    e.preventDefault();
                    const { x, y } = getMousePos(e);
                    context.beginPath();
                    context.moveTo(x, y);
                    isDownRef.current = true;
                    pointsRef.current.push({ x, y });
                    beginPointRef.current = { x, y };
                }

                canvasRef.current.addEventListener('mousedown', handleMouseDown)

                const handleMouseMove = (e: MouseEvent) => {
                    if (!isDownRef.current) return;
                    pointsRef.current.push(getMousePos(e))

                    if (pointsRef.current.length > 3 && beginPointRef.current) {
                        const lastTwoPoints = pointsRef.current.slice(-2);
                        const controlPoint = lastTwoPoints[0];
                        const endPoint = {
                            x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
                            y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
                        }
                        drawLine(context, beginPointRef.current, controlPoint, endPoint)
                        beginPointRef.current = endPoint;
                    }
                }
                canvasRef.current.addEventListener('mousemove', handleMouseMove)

                canvasRef.current?.addEventListener('mouseup', (e: MouseEvent) => {
                    if (!isDownRef.current) return;
                    pointsRef.current.push(getMousePos(e));

                    if (pointsRef.current.length > 3 && beginPointRef.current) {
                        const lastTwoPoints = pointsRef.current.slice(-2);
                        const controlPoint = lastTwoPoints[0];
                        const endPoint = lastTwoPoints[1];
                        drawLine(context, beginPointRef.current, controlPoint, endPoint)
                    }
                    beginPointRef.current = null;
                    isDownRef.current = false;
                    pointsRef.current = [];

                    canvasRef.current?.addEventListener('mousemove', handleMouseMove);
                })
            }
        }
        return () => {
        }
    }, [])

    return useMemo(() => {
        console.log('渲染画面');

        return (
            <div className="comp-canvas">
                <canvas id='drawing' width={800} height={600} ref={canvasRef}>这是一个画布</canvas>
            </div>
        );
    }, []);
};

export default Canvas;