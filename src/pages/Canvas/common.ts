import { getCryptoUuid } from "../../utils/util";
import { EShape } from "../Toolbar/common";

export const STROKE_WIDTH = 5;
export const CANVAS_WIDTH = 800;
export const CANVAS_HEITHT = 600;

const COMMON_SHAPE_SIZE = 100;
export const INPUT_OFFSET = {
    x: COMMON_SHAPE_SIZE / 2,
    y: 10,
}

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
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
}

export type IShapeData = IRectData | ICircleData;

export interface IRectData {
    // width: number;
    // height: number;
}

export interface ICircleData {
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
/**
 * @description: 根据不同形状种类，生成初始图形数据
 * @param {EShape} name 形状种类
 * @param {number} x 初始放置x坐标
 * @param {number} y
 * @return {IShape}
 */
export const getInitShapeData = (name: EShape, x: number, y: number): IShape => {
    const id = getCryptoUuid();
    // const commonData = {
    //     x,
    //     y,
    // }
    let data: IShapeData = {} as any;
    switch (name) {
        case EShape.RECT:
            data = {}
            break;
        case EShape.CIRCLE:
            data = {
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
        x,
        y,
        text: "",
        width: COMMON_SHAPE_SIZE,
        height: COMMON_SHAPE_SIZE,
    }
}

/**
 * @description: 根据图形数据分类绘制图形，并对选中图形进行描边
 * @param {CanvasRenderingContext2D} ctx
 * @param {IShape} shapes
 * @param {string} selectedId
 * @return {*}
 */
export const drawShape = (ctx: CanvasRenderingContext2D | null, shapes: IShape[], selectedId: string) => {
    if (ctx) {
        shapes.forEach(shape => {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "green";
            ctx.lineWidth = STROKE_WIDTH;
            const { x, y, text, width, height } = shape;
            // 绘制形状
            if (shape.type === EShape.RECT) {
                ctx.fillRect(x - COMMON_SHAPE_SIZE / 2, y - COMMON_SHAPE_SIZE / 2, width, height);
                if (selectedId === shape.id) {
                    ctx.strokeRect(x - COMMON_SHAPE_SIZE / 2, y - COMMON_SHAPE_SIZE / 2, width, height);
                }
            } else if (shape.type === EShape.CIRCLE) {
                const { radius, startAngle, endAngle, counterclockwise } = shape.data as ICircleData;
                ctx.beginPath();
                ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
                ctx.fill();
                if (selectedId === shape.id) {
                    ctx.stroke();
                }
            }
            // 绘制文字
            if (text) {
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.font = "14px sans-serif"
                ctx.fillText(text, x, y);
            }
        })
    }
}

/**
 * @description: 判断鼠标点是否在某个图形内
 * @param {number} pointX
 * @param {number} pointY
 * @param {IShape} shape
 * @return {*}
 */
export const isPointInShape = (pointX: number, pointY: number, shape: IShape) => {
    const { x, y, width, height } = shape;
    const left = x - COMMON_SHAPE_SIZE / 2;
    const top = y - COMMON_SHAPE_SIZE / 2;
    return pointX >= left
        && pointX <= left + width
        && pointY >= top
        && pointY <= top + height;
    // if (shape.type === EShape.RECT) {
    //     const left = x - COMMON_SHAPE_SIZE / 2;
    //     const top = y - COMMON_SHAPE_SIZE / 2;
    //     return pointX >= left
    //         && pointX <= left + width
    //         && pointY >= top
    //         && pointY <= top + height;
    // } else if (shape.type === EShape.CIRCLE) {
    //     const { radius } = shape.data as ICircleData;
    //     const dx = pointX - x;
    //     const dy = pointY - y;
    //     return dx * dx + dy * dy <= radius * radius;
    // }
}