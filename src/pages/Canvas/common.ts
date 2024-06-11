import { getCryptoUuid } from "../../utils/util";
import { EShape } from "../Toolbar/common";

export const STROKE_WIDTH = 5;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEITHT = 600;
export interface IPoint {
    x: number;
    y: number;
}

export interface IMouseInfo {
    isDown: boolean;
    mouseOffset: IPoint;
}
export interface IShape {
    id: string;
    type: EShape;
    data: IShapeData;
}

export type IShapeData = IRectData | ICircleData;
export interface IShapeCommonData {
    x: number;
    y: number;
}
export interface IRectData extends IShapeCommonData {
    width: number;
    height: number;
}

export interface ICircleData extends IShapeCommonData {
    radius: number;
    startAngle: number;
    endAngle: number;
    counterclockwise: boolean;
}
export const DEFAULT_MOUSE_INFO = {
    isDown: false,
    mouseOffset: {
        x: 0,
        y: 0
    }
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

export const getInitShapeData = (name: EShape, x: number, y: number) => {
    const id = getCryptoUuid();
    const commonData = {
        x,
        y,
    }
    let data: IShapeData = {} as any;
    switch (name) {
        case EShape.RECT:
            data = {
                ...commonData,
                width: 100,
                height: 100,
            }
            break;
        case EShape.CIRCLE:
            data = {
                ...commonData,
                radius: 50,
                startAngle: 0,
                endAngle: 2 * Math.PI,
                counterclockwise: false,
            }
            break;
        default:
            break;
    }

    return {
        type: name,
        id,
        data,
    }
}

export const drawShap = (ctx: CanvasRenderingContext2D | null, shape: IShape, selectedId: string) => {
    if (ctx) {
        ctx.fillStyle = "orange";
        ctx.strokeStyle = "green";
        ctx.lineWidth = STROKE_WIDTH;
        if (shape.type === EShape.RECT) {
            const { x, y, width, height } = shape.data as IRectData;
            ctx.fillRect(x, y, width, height);
            if (selectedId === shape.id) {
                ctx.strokeRect(x, y, width, height);
            }
        } else if (shape.type === EShape.CIRCLE) {
            const { x, y, radius, startAngle, endAngle, counterclockwise } = shape.data as ICircleData;
            ctx.beginPath();
            ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
            ctx.fill();
            if (selectedId === shape.id) {
                ctx.stroke();
            }
        }
    }
}

export const isPointInShape = (pointX: number, pointY: number, shape: IShape) => {
    if (shape.type === EShape.RECT) {
        const { x, y, width, height } = shape.data as IRectData;
        return pointX >= x && pointX <= x + width && pointY >= y && pointY <= y + height;
    } else if (shape.type === EShape.CIRCLE) {
        const { x, y, radius } = shape.data as ICircleData;
        const dx = pointX - x;
        const dy = pointY - y;
        return dx * dx + dy * dy <= radius * radius;
    }
}