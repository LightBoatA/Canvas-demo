import { EShape } from "../../Toolbar/common";
import { getCtrlPoints } from "./calculator";
import { CANVAS_WIDTH, CANVAS_HEITHT, GRID_SIZE, CTRL_POINT_HALF_SIZE, STROKE_WIDTH, COLOR_GRID, COLOR_BORDER, COLOR_CTRL_POINT, COLOR_SHAPE, FONT_COLOR, CONNECT_POINT_RADIUS, COLOR_CONNECT_POINT } from "./constant";
import { IShape, ICircleData, IPoint } from "./types";

export const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = COLOR_GRID; // 网格线的颜色
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
 * 绘制缩放控制点
 * @param ctx 
 * @param shape 
 */
const drawControlPoints = (ctx: CanvasRenderingContext2D, shape: IShape) => {
    const points = getCtrlPoints(shape);
    const halfSize = CTRL_POINT_HALF_SIZE;
    ctx.fillStyle = COLOR_CTRL_POINT;
    points.forEach(point => {
        ctx.fillRect(point.x, point.y, halfSize * 2, halfSize * 2);
    });

}

/**
 * 绘制连接点
 * @param ctx 
 * @param shape 
 */
const drawConnectPoints = (ctx: CanvasRenderingContext2D, shape: IShape) => {
    const { x, y, width, height } = shape;
    const points = [
        { x, y: y - height / 2 },
        { x: x + width / 2, y },
        { x, y: y + height / 2 },
        { x: x - width / 2, y },
    ]

    ctx.strokeStyle = COLOR_BORDER;
    ctx.fillStyle = '#FFF';
    ctx.lineWidth = 1;
    points.forEach(point => {
        const { x: _x, y: _y } = point;
        ctx.beginPath();
        ctx.arc(_x, _y, CONNECT_POINT_RADIUS, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    })
}
/**
 * 绘制选中边框
 * @param ctx 
 * @param shape 
 */
const drawSelectedBorder = (ctx: CanvasRenderingContext2D, shape: IShape) => {
    const { x, y, width, height } = shape;
    ctx.strokeStyle = COLOR_BORDER;
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
    ctx.strokeStyle = COLOR_BORDER;
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
            ctx.fillStyle = COLOR_SHAPE;
            ctx.lineWidth = STROKE_WIDTH;
            const { x, y, text, width, height } = shape;
            // 绘制形状
            if (shape.type === EShape.RECT) {
                ctx.fillRect(x - width / 2, y - height / 2, width, height);
            } else if (shape.type === EShape.CIRCLE) {
                ctx.beginPath();
                ctx.ellipse(x, y, width / 2, height / 2, 0, 0, 2 * Math.PI);
                ctx.fill();
            } else if (shape.type === EShape.DIAMOND) {
                ctx.beginPath();
                ctx.moveTo(x, y - height / 2); // 上方顶点
                ctx.lineTo(x + width / 2, y);
                ctx.lineTo(x, y + height / 2);
                ctx.lineTo(x - width / 2, y);
                ctx.closePath();
                ctx.fill();
            } else if (shape.type === EShape.ROUNDED_RECT) {
                ctx.beginPath()
                ctx.roundRect(x - width / 2, y - height / 2, width, height, height / 2)
                ctx.closePath();
                ctx.fill();
            }
            // 绘制图形选中后的各种控制图形
            if (selectedId === shape.id) {
                drawCtrlShape(ctx, shape);
                drawConnectPoints(ctx, shape);
            }

            if (hoveringId === shape.id) {
                drawHoveringShape(ctx, shape);
                drawConnectPoints(ctx, shape);
            }
            // 绘制文字
            if (text) {
                ctx.fillStyle = FONT_COLOR;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                // ctx.font = "bold 14px sans-serif"
                ctx.font = "14px sans-serif"
                ctx.fillText(text, x, y);
            }
        })
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