import { getCryptoUuid } from "../../utils/util";
import { EShape } from "../Toolbar/common";

export const STROKE_WIDTH = 2; // 描边尺寸
export const CANVAS_WIDTH = 800; // 画布宽
export const CANVAS_HEITHT = 600; // 画布高
const GRID_SIZE = 20; // 背景网格线之间的间距

const CTRL_POINT_HALF_SIZE = 5; // 缩放控制点半边长
const COMMON_SHAPE_SIZE = 100; // 形状边长

// 文字输入框相对于形状中心坐标的偏移值
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

export const DEFAULT_MOUSE_INFO = {
    isDown: false,
    mouseOffset: {
        x: 0,
        y: 0
    }
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

}

export interface ICircleData {
    radius: number;
    startAngle: number;
    endAngle: number;
    counterclockwise: boolean;
}

export enum EDirection {
    LEFT_TOP = 'LEFT_TOP',
    LEFT_BOTTOM = 'LEFT_BOTTOM',
    RIGHT_TOP = 'RIGHT_TOP',
    RIGHT_BOTTOM = 'RIGHT_BOTTOM',
}

// 不同方向对应的缩放光标样式
export const cursorDirectionMap = {
    [EDirection.LEFT_TOP]: "nwse-resize",
    [EDirection.LEFT_BOTTOM]: "nesw-resize",
    [EDirection.RIGHT_BOTTOM]: "nwse-resize",
    [EDirection.RIGHT_TOP]: "nesw-resize",
}
export interface ICtrlPoint {
    x: number;
    y: number;
    direction: EDirection;
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
 * 根据id找到对应shape
 * @param shapes 
 * @param id 
 * @returns 
 */
export const getShapeById = (shapes: IShape[], id: string) => {
    const resShape = shapes.find(shape => shape.id === id);
    return resShape;
}

/**
 * 根据不同形状种类，生成初始图形数据
 * @param name 形状种类名称
 * @param x 初始放置的x坐标
 * @param y 
 * @returns 
 */
export const getInitShapeData = (name: EShape, x: number, y: number): IShape => {
    const id = getCryptoUuid();
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
 * 计算缩放后的图形数据
 * @param cursorX 
 * @param cursorY 
 * @param oldData 
 * @param hoveringCtrlPoint 拖拽的缩放控制点
 * @returns 
 */
export const calcResizedShape = (cursorX: number, cursorY: number, oldData: IShape, hoveringCtrlPoint: ICtrlPoint) => {
    const { direction } = hoveringCtrlPoint;
    const { x, y, width, height } = oldData;

    let
        left = x - width / 2,
        top = y - height / 2,
        bottom = y + height / 2,
        right = x + width / 2,
        newX = x,
        newY = y,
        newWidth = width,
        newHeight = height;

    switch (direction) {
        case EDirection.RIGHT_BOTTOM:
            // 右下角
            newWidth = Math.abs(cursorX - left);
            newHeight = Math.abs(cursorY - top);
            newX = left + newWidth / 2;
            newY = top + newHeight / 2;
            break;
        case EDirection.RIGHT_TOP:
            // 右上角
            newWidth = Math.abs(cursorX - left);
            newHeight = Math.abs(cursorY - bottom);
            newX = left + newWidth / 2;
            newY = bottom - newHeight / 2;
            break;
        case EDirection.LEFT_BOTTOM:
            // 左下角
            newWidth = Math.abs(cursorX - right);
            newHeight = Math.abs(cursorY - top);
            newX = right - newWidth / 2;
            newY = top + newHeight / 2;
            break;
        case EDirection.LEFT_TOP:
            // 左上角
            newWidth = Math.abs(cursorX - right);
            newHeight = Math.abs(cursorY - bottom);
            newX = right - newWidth / 2;
            newY = bottom - newHeight / 2;
            break;
        default:
            break;
    }

    return {
        ...oldData,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight
    }
}

/**
 * 判断某点是否在某个矩形区域内
 * @param pointX 
 * @param pointY 
 * @param x 
 * @param y 
 * @param width 
 * @param height 
 * @returns 
 */
const isPointInRect = (pointX: number, pointY: number, x: number, y: number, width: number, height: number) => {
    // const left = x - COMMON_SHAPE_SIZE / 2;
    // const top = y - COMMON_SHAPE_SIZE / 2;
    return pointX >= x
        && pointX <= x + width
        && pointY >= y
        && pointY <= y + height;
}

/**
 * 计算并返回某一形状的所有缩放控制点信息
 * @param shape 
 * @returns 
 */
export const getCtrlPoints = (shape: IShape): ICtrlPoint[] => {
    const { x, y, width, height } = shape;
    const halfSize = CTRL_POINT_HALF_SIZE; // 控制点的半径

    const points: ICtrlPoint[] = [
        { x: x - width / 2 - halfSize, y: y - height / 2 - halfSize, direction: EDirection.LEFT_TOP }, // 左上
        { x: x + width / 2 - halfSize, y: y - height / 2 - halfSize, direction: EDirection.RIGHT_TOP }, // 右上
        { x: x - width / 2 - halfSize, y: y + height / 2 - halfSize, direction: EDirection.LEFT_BOTTOM }, // 左下
        { x: x + width / 2 - halfSize, y: y + height / 2 - halfSize, direction: EDirection.RIGHT_BOTTOM }, // 右下
    ];

    return points;
}
/**
 * 绘制缩放控制点
 * @param ctx 
 * @param shape 
 */
const drawControlPoints = (ctx: CanvasRenderingContext2D, shape: IShape) => {
    const points = getCtrlPoints(shape);
    const halfSize = CTRL_POINT_HALF_SIZE;
    ctx.fillStyle = 'blue';
    points.forEach(point => {
        ctx.fillRect(point.x, point.y, halfSize * 2, halfSize * 2);
    });

}

/**
 * 某点是否在缩放控制点形状内
 * @param pointX 
 * @param pointY 
 * @param shape 
 */
export const getIntersectedControlPoint = (pointX: number, pointY: number, shape: IShape, points: ICtrlPoint[]) => {
    // 预判断：如果不在（图形+控制点）的大范围框内，直接返回null
    const { x, y, width, height } = shape;
    const rectX = x - width / 2 - CTRL_POINT_HALF_SIZE;
    const rectY = y - height / 2 - CTRL_POINT_HALF_SIZE;
    const rectWidth = width + CTRL_POINT_HALF_SIZE * 2;
    const rectHeight = height + CTRL_POINT_HALF_SIZE * 2;
    if (!isPointInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight)) {
        return null;
    }
    // 逐个计算控制点是否与鼠标点相交
    for (let i = 0; i < points.length; i++) {
        const { x: _x, y: _y } = points[i];
        if (isPointInRect(pointX, pointY, _x, _y, CTRL_POINT_HALF_SIZE * 2, CTRL_POINT_HALF_SIZE * 2)) {
            return points[i];
        }
    }

    return null;
}

export const drawGrid = (ctx: CanvasRenderingContext2D) => {
    // ctx.strokeStyle = "#e0e0e0"; // 网格线的颜色
    ctx.strokeStyle = "#e0e0e0"; // 网格线的颜色
    ctx.lineWidth = 1;
    const width = CANVAS_WIDTH;
    const height = CANVAS_HEITHT;
    // 绘制竖线
    for (let x = 0; x <= width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
        ctx.closePath();
    }

    // 绘制横线
    for (let y = 0; y <= height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
        ctx.closePath();
    }
}
/**
 * 绘制选中边框
 * @param ctx 
 * @param shape 
 */
const drawSelectedBorder = (ctx: CanvasRenderingContext2D, shape: IShape) => {
    const { x, y, width, height } = shape;
    ctx.strokeStyle = "green";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);
}

/**
 * 绘制选中边框、缩放控制点等控制类图形
 * @param ctx 
 * @param shape 
 */
const drawCtrlShape = (ctx: CanvasRenderingContext2D, shape: IShape) => {
    drawSelectedBorder(ctx, shape);
    drawControlPoints(ctx, shape);
}

/**
 * 绘制鼠标悬停状态下的边框
 * @param ctx 
 * @param shape 
 */
const drawHoveringShape = (ctx: CanvasRenderingContext2D, shape: IShape) => {
    const { x, y, width, height } = shape;
    ctx.strokeStyle = "green";
    ctx.lineWidth = 1;
    ctx.strokeRect(x - width / 2, y - height / 2, width, height);
}

/**
 * 根据图形数据分类绘制图形，并对选中图形进行描边
 * @param ctx 
 * @param shapes 
 * @param selectedId 
 */
export const drawShape = (ctx: CanvasRenderingContext2D | null, shapes: IShape[], selectedId: string, hoveringId: string) => {
    if (ctx) {
        shapes.forEach(shape => {
            ctx.fillStyle = "white";
            ctx.lineWidth = STROKE_WIDTH;
            const { x, y, text, width, height } = shape;
            // 绘制形状
            if (shape.type === EShape.RECT) {
                ctx.fillRect(x - width / 2, y - height / 2, width, height);
            } else if (shape.type === EShape.CIRCLE) {
                const { radius, startAngle, endAngle, counterclockwise } = shape.data as ICircleData;
                ctx.beginPath();
                // ctx.arc(x, y, radius, startAngle, endAngle, counterclockwise);
                ctx.ellipse(x, y, width / 2, height / 2, 0, 0, 2 * Math.PI);
                ctx.fill();

            }
            // 绘制图形选中后的各种控制图形
            if (selectedId === shape.id) {
                drawCtrlShape(ctx, shape);
            }

            if (hoveringId === shape.id) {
                drawHoveringShape(ctx, shape);
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
 * 判断鼠标点是否在某个图形内
 * @param pointX 
 * @param pointY 
 * @param shape 
 * @returns 
 */
export const isPointInShape = (pointX: number, pointY: number, shape: IShape) => {
    const { x, y, width, height } = shape;
    return isPointInRect(pointX, pointY, x - width / 2, y - height / 2, width, height);
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