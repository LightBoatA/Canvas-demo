import { EShape } from "../../Toolbar/common";
import AStar from "../routers/AStar";
import { computedProbablyPoints, getConnectionRoutes } from "../routers/utils";
import { getCtrlPoints } from "./calculator";
import { CANVAS_WIDTH, CANVAS_HEITHT, GRID_SIZE, CTRL_POINT_HALF_SIZE, STROKE_WIDTH, COLOR_GRID, COLOR_BORDER, COLOR_CTRL_POINT, COLOR_SHAPE, FONT_COLOR, CONNECT_POINT_RADIUS, COLOR_CONNECT_POINT, COLOR_DASHLINE, STRING_CONNECTOR, COLOR_CONNECTION, COLOR_BORDER_HOVER } from "./constant";
import { IShape, ICircleData, IPoint, IConnection, EConnectPointDirection, IConnectionPoint, IShapeConnectionPoint } from "./types";
import { getConnectionPointByDirection, getPointByConnectionPointInfo, getShapeById } from "./utils";

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
const drawConnectPoints = (ctx: CanvasRenderingContext2D, shape: IShape, hovingConnectionPoint: IShapeConnectionPoint | null) => {
    console.log(shape, hovingConnectionPoint);
    
    // if (hovingConnectionPoint) {
        const { connectionPoints } = shape;
        // const { id: shapeId } = hovingConnectionPoint.shape;
        // const { direction: pointDirection } = hovingConnectionPoint.point;
        // const [shapeId, pointDirection] = connectionPointInfo.split(STRING_CONNECTOR);
        // ctx.strokeStyle = COLOR_BORDER;
        ctx.fillStyle = '#FFF';
        ctx.lineWidth = 1;
        connectionPoints.forEach(point => {
            const { x: _x, y: _y } = point;
            const ishovering = hovingConnectionPoint 
            && hovingConnectionPoint.shape.id  === shape.id 
            && hovingConnectionPoint.point.direction === point.direction;
            ctx.strokeStyle = ishovering ? COLOR_BORDER_HOVER : COLOR_BORDER;
            ctx.lineWidth = ishovering ? 2 : 1;
            ctx.beginPath();
            ctx.arc(_x, _y, CONNECT_POINT_RADIUS, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.stroke();
        })
    // }
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
 * 根据起止点绘制直线
 * @param ctx 
 * @param from 
 * @param to 
 */
const drawLine = (ctx: CanvasRenderingContext2D, from: IPoint, to: IPoint) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
}



/**
 * 用于测试连线路由选择辅助点绘制
 * @param ctx 
 * @param points 
 * @param startPoint 
 * @param endPoint 
 * @param fakeStartPoint 
 * @param fakeEndPoint 
 */
const drawTestHelpPoint = (ctx: CanvasRenderingContext2D, points: number[][], startPoint: number[], endPoint: number[], fakeStartPoint: number[], fakeEndPoint: number[]) => {
    points.forEach((point: number[]) => {
        const [x, y] = point;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI, false);
        ctx.fill();
    })

    ctx.fillStyle = 'black';
    const [x3, y3] = startPoint;
    ctx.beginPath();
    ctx.arc(x3, y3, 4, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.fillStyle = 'black';
    const [x4, y4] = startPoint;
    ctx.beginPath();
    ctx.arc(x4, y4, 4, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.fillStyle = 'red';
    const [x, y] = fakeStartPoint;
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.fillStyle = 'red';
    const [x1, y1] = fakeEndPoint;
    ctx.beginPath();
    ctx.arc(x1, y1, 4, 0, 2 * Math.PI, false);
    ctx.fill();

    ctx.fillStyle = COLOR_SHAPE;
}

/**
 * 根据坐标点数组绘制折线
 * @param ctx 
 * @param routes 
 * @param lineDashSegments 
 * @param strokeStyle 
 * @param lineWidth 
 */
const drawPolyLine = (ctx: CanvasRenderingContext2D, routes: number[][], lineDashSegments: number[] = [], strokeStyle: string = COLOR_CONNECTION, lineWidth: number = 1) => {
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    ctx.setLineDash(lineDashSegments);
    ctx.beginPath();
    ctx.moveTo(routes[0][0], routes[0][1]);
    routes.forEach(route => {
        ctx.lineTo(route[0], route[1]);
    })
    ctx.stroke();
    ctx.setLineDash([]);
}
/**
 * 绘制连接线
 * @param ctx 
 * @param shapes 
 * @param connections 
 */
const drawConnections = (ctx: CanvasRenderingContext2D, shapes: IShape[], connections: IConnection[]) => {
    connections.forEach(connection => {
        const { fromShape, fromPoint, toShape, toPoint } = connection;
        // 根据ID获取最新的xy,否则移动形状时不更新
        const latestFromShape = shapes.find(shape => shape.id === fromShape.id);
        const latestFromPoint = latestFromShape?.connectionPoints.find(point => point.direction === fromPoint.direction);
        const latestToShape = shapes.find(shape => shape.id === toShape.id);
        const latestToPoint = latestToShape?.connectionPoints.find(point => point.direction === toPoint.direction);
        // 获取路由数据
        const routes = getConnectionRoutes(
            latestFromShape || fromShape,
            latestToShape || toShape, 
            latestFromPoint || fromPoint, 
            latestToPoint || toPoint);

        // 绘制折线
        drawPolyLine(ctx, routes)
    })
}

/**
 * 绘制连接线-虚线
 * @param ctx 
 * @param dashLine 
 */
const drawDashLine = (ctx: CanvasRenderingContext2D, preparedConnection: IConnection) => {
    const { fromShape, toShape, fromPoint, toPoint } = preparedConnection;
    const routes = getConnectionRoutes(fromShape,toShape, fromPoint, toPoint);
    // 绘制折线
    drawPolyLine(ctx, routes, [5, 5], COLOR_DASHLINE)
}
/**
 * 根据图形数据分类绘制图形，并对选中图形进行描边
 * @param ctx 
 * @param shapes 
 * @param selectedId 
 */
export const drawShape = (
    ctx: CanvasRenderingContext2D | null,
    shapes: IShape[],
    selectedId: string,
    hoveringId: string,
    preparedConnection: IConnection | null,
    connections: IConnection[],
    hoveringConnectionPoint: IShapeConnectionPoint | null, // shapeId-connectionPointDirection
) => {
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
            // 绘制连接点虚线
            if (preparedConnection) {
                drawDashLine(ctx, preparedConnection);
            }
            // 绘制连接线
            if (connections && connections.length) {
                drawConnections(ctx, shapes, connections);
            }
            // 绘制图形选中后的各种控制图形
            if (selectedId === shape.id) {
                drawCtrlShape(ctx, shape);
                drawConnectPoints(ctx, shape, hoveringConnectionPoint);
            }

            if (hoveringId === shape.id) {
                drawHoveringShape(ctx, shape);
                drawConnectPoints(ctx, shape, hoveringConnectionPoint);
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

            // 绘制hovering连接点
            // if (hoveringConnectionPointInfo && 
            //     hoveringConnectionPointInfo.split(STRING_CONNECTOR)[0] === shape.id) 
            //     {
            // }
        })
    }
}

// export const drawLine = (
//     ctx: CanvasRenderingContext2D,
//     beginPoint: IPoint,
//     controlPoint: IPoint,
//     endPoint: IPoint) => {
//     ctx.beginPath();
//     ctx.moveTo(beginPoint.x, beginPoint.y);
//     ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, endPoint.x, endPoint.y);
//     ctx.stroke();
//     ctx.closePath();
// }