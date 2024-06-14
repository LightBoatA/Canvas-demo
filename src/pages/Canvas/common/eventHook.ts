import { DragEventHandler, MouseEventHandler, RefObject, useEffect, useRef } from "react"

type CanvasRef = RefObject<HTMLCanvasElement>;

interface CanvasEvents {
    onMouseDown: (event: MouseEvent) => void;
    onMouseMove: MouseEventHandler;
    onMouseUp: MouseEventHandler;
    onDoubleClick: MouseEventHandler;
    handleDragover: DragEventHandler;
    handleDrop: DragEventHandler;
}
const useCanvasEvents = (
    canvasRef: CanvasRef,
    {
        onMouseDown,
        onMouseMove,
        onMouseUp,
        onDoubleClick,
        handleDragover,
        handleDrop,
    }: CanvasEvents
): void => {
    const mouseDownRef = useRef<boolean>(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        // const canvas = document.getElementById("drawing");

        const handleMouseDown: MouseEventHandler = (e) => {
            mouseDownRef.current = true;
            onMouseDown && onMouseDown(e.nativeEvent);
        }

        const handleMouseMove: MouseEventHandler = (e) => {
            if (mouseDownRef.current) {
                onMouseMove && onMouseMove(e);
            }
        };

        const handleMouseUp: MouseEventHandler = (e) => {
            mouseDownRef.current = false;
            onMouseUp && onMouseUp(e);
        };

        const handleDoubleClick: MouseEventHandler = (e) => {
            onDoubleClick && onDoubleClick(e);
        };

        // if (canvas) {
        //     canvas.addEventListener('mousedown', handleMouseDown);
        //     canvas.addEventListener('mousemove', handleMouseMove);
        //     canvas.addEventListener('mouseup', handleMouseUp);
        //     canvas.addEventListener('dblclick', handleDoubleClick);
        //     canvas.addEventListener('dragover', handleDragover);
        //     canvas.addEventListener('drop', handleDrop);
        // }

        // return () => {
        //     if (canvas) {
        //       canvas.removeEventListener('mousedown', handleMouseDown);
        //       canvas.removeEventListener('mousemove', handleMouseMove);
        //       canvas.removeEventListener('mouseup', handleMouseUp);
        //       canvas.removeEventListener('dblclick', handleDoubleClick);
        //       canvas.removeEventListener('dragover', handleDragover);
        //       canvas.removeEventListener('drop', handleDrop);
        //     }
        //   };
    })
}