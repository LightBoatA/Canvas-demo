import { EShape } from "../../Toolbar/common";
import { CTRL_POINT_HALF_SIZE, GRID_SIZE, SNAP_DISTANCE, STRING_CONNECTOR } from "./constant";
import { IShape, ICtrlPoint, EDirection, IShapeConnectionPoint, IConnection, IConnectionPoint, EConnectPointDirection } from "./types";

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
    return pointX >= x
        && pointX <= x + width
        && pointY >= y
        && pointY <= y + height;
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

// /**
//  * 获取对齐到网格的坐标点
//  * @param x 
//  * @param y 
//  * @returns 
//  */
// export const getSnapXY = (x: number, y: number) => {
//     const snapX = Math.round(x / GRID_SIZE) * GRID_SIZE;
//     const snapY = Math.round(y / GRID_SIZE) * GRID_SIZE;
//     return { x: snapX, y: snapY }
// }

export const getMousePos = (e: MouseEvent) => {
    return {
        x: e.offsetX,
        y: e.offsetY,
    }
}

/**
 * 获取与某坐标点相交的连接点信息（shapeId-connectionPointDirection）
 * @param shapes 
 * @param x 
 * @param y 
 * @returns 
 */
export const getIntersectedConnectionPoint = (shapes: IShape[], x: number, y: number) => {
    for (let i = 0; i < shapes.length; i++) {
        const points = shapes[i].connectionPoints;
        for (let j = 0; j < points.length; j++) {
            if (Math.abs(x - points[j].x) < 3 &&
                Math.abs(y - points[j].y) < 3
            ) {
                // return `${shapes[i].id}${STRING_CONNECTOR}${points[j].direction}`
                return {
                    shape: shapes[i],
                    point: points[j],
                }
            }

        }
    }
    return null;
}

/**
 * 根据鼠标位置，构造出虚拟结束连接点
 * @param offsetX 鼠标坐标
 * @param offsetY 
 * @param startX 起始连接点的坐标
 * @param startY 
 * @returns 
 */
export const getVirtualEndPoint = (offsetX: number, offsetY: number, startX: number, startY: number): IShapeConnectionPoint => {
    // 判断连线端点的箭头方向，与起始点作比较
    // 左还是右
    let dh = offsetX > startX ? EConnectPointDirection.LEFT : EConnectPointDirection.RIGHT;
    // 上还是下
    let dv = offsetY > startY ? EConnectPointDirection.TOP : EConnectPointDirection.BOTTOM;
    const distenceH = Math.abs(offsetX - startX);
    const distenceV = Math.abs(offsetY - startY);
    let direction = distenceH > distenceV ? dh : dv;
    // 构造出结束点
    const point: IConnectionPoint = {
        x: offsetX,
        y: offsetY,
        direction,
    }
    // 构造出结束形状
    const shape: IShape = {
        id: '',
        type: EShape.RECT,
        data: {},
        x: offsetX,
        y: offsetY,
        width: 2,
        height: 2,
        text: "",
        connectionPoints: [point]
    }
    return {
        shape,
        point,
    }
}


export const getSnapXY = (x: number, y: number, width: number, height: number, hVals: number[], vVals: number[]) => {
    // const yArr: number = [];
    let snapX = x;
    let snapY = y;
    let found = false;
    const top = y - height / 2;
    const bottom = y + height / 2;
    const left = x - width / 2;
    const right = x + width / 2;

    console.log(x, width, vVals);
    
    for (let i = 0; i < hVals.length; i++) {
        // 上边靠近
        // if (Math.abs(hVals[i] - top) <= SNAP_DISTANCE) {
        //     snapY = hVals[i] + height / 2;
        //     found = true;
        // }
        // // 上边靠近
        // if (Math.abs(hVals[i] - bottom) <= SNAP_DISTANCE) {
        //     snapY = hVals[i] - height / 2;
        //     found = true;
        // }
        // 左边靠近
        // if (Math.abs(vVals[i] - left) <= SNAP_DISTANCE) {
        //     snapX = hVals[i] + width / 2;
        //     found = true;
        // }
        // // 右边靠近
        if (Math.abs(vVals[i] - right) <= SNAP_DISTANCE) {
            
            snapX = hVals[i] - width / 2;
            // console.log(x, right, vVals[i], snapX);
            found = true;
        }
        if (found) {
            return { snapX, snapY }
        }
    }
    return { snapX, snapY }

}