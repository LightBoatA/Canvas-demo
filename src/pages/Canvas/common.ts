import { getCryptoUuid } from "../../utils/util";
import { EShape } from "../Toolbar/common";

export const STROKE_WIDTH = 5;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEITHT = 600;

export const INPUT_OFFSET = {
    x: 0,
    y: 10,
}

const COMMON_SHAPE_SIZE = 100;
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
                // x: x + COMMON_SHAPE_SIZE / 2,
                // y: y + COMMON_SHAPE_SIZE / 2,
                width: COMMON_SHAPE_SIZE,
                height: COMMON_SHAPE_SIZE,
            }
            break;
        case EShape.CIRCLE:
            data = {
                ...commonData,
                radius: COMMON_SHAPE_SIZE / 2,
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
        ctx.fillStyle = "white";
        ctx.strokeStyle = "green";
        ctx.lineWidth = STROKE_WIDTH;
        if (shape.type === EShape.RECT) {
            const { x, y, width, height } = shape.data as IRectData;
            ctx.fillRect(x - COMMON_SHAPE_SIZE / 2, y - COMMON_SHAPE_SIZE / 2, width, height);
            if (selectedId === shape.id) {
                ctx.strokeRect(x - COMMON_SHAPE_SIZE / 2, y - COMMON_SHAPE_SIZE / 2, width, height);
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
        const left = x - COMMON_SHAPE_SIZE / 2;
        const top = y - COMMON_SHAPE_SIZE / 2;
        return pointX >= left
            && pointX <= left + width
            && pointY >= top
            && pointY <= top + height;
    } else if (shape.type === EShape.CIRCLE) {
        const { x, y, radius } = shape.data as ICircleData;
        const dx = pointX - x;
        const dy = pointY - y;
        return dx * dx + dy * dy <= radius * radius;
    }
}