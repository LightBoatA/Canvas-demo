export interface IPoint {
    x: number;
    y: number;
}

export const getMousePos = (e: MouseEvent) => {
    return {
        x: e.offsetX,
        y: e.offsetY,
    }
}

export const drawLine = (
    ctx: CanvasRenderingContext2D, 
    beginPoint: IPoint, 
    controlPoint: IPoint, 
    endPoint: IPoint) => {
        ctx.beginPath();
        ctx.moveTo(beginPoint.x, beginPoint.y);
        ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
        ctx.stroke();
        ctx.closePath();
}