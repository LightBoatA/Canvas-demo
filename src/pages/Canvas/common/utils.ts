import { getCryptoUuid } from "../../../utils/util";
import { EShape } from "../../Toolbar/common";
import { getConnectionPointVal, isPointInLine, isPointInShape } from "./calculator";
import { COMMON_SHAPE_SIZE, INIT_SHAPES, STRING_CONNECTOR } from "./constant";
import { EConnectPointDirection, EDirection, IConnection, IConnectionPoint, IShape, IShapeData } from "./types";


/**
 * 获取形状的边界坐标值
 * @param rect 
 * @returns 
 */
export const getRectBounds = (rect: IShape) => {
    const { x, y, width, height } = rect;
    return {
        top: y - height / 2,
        right: x + width / 2,
        bottom: y + height / 2,
        left: x - width / 2
    }
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
    const shapeData = INIT_SHAPES[name];
    const { width, height } = shapeData;
    const connectionPoints: IConnectionPoint[] = [
        getConnectionPointVal(x, y, width, height, EConnectPointDirection.TOP),
        getConnectionPointVal(x, y, width, height, EConnectPointDirection.RIGHT),
        getConnectionPointVal(x, y, width, height, EConnectPointDirection.BOTTOM),
        getConnectionPointVal(x, y, width, height, EConnectPointDirection.LEFT),
    ]
    return {
        ...shapeData,
        id,
        x,
        y,
        connectionPoints,
    }
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

export const getConnectionPointByDirection = (points: IConnectionPoint[], direction: EConnectPointDirection) => {
    const resPoint = points.find(point => point.direction === direction);
    return resPoint;
}

export const getPointByConnectionPointInfo = (shapes: IShape[], connectionPointInfo: string) => {
    const [shapeId, pointDirection] = connectionPointInfo.split(STRING_CONNECTOR);
    const shape = getShapeById(shapes, shapeId);
    const point = getConnectionPointByDirection(shape?.connectionPoints || [], pointDirection as EConnectPointDirection);
    return point;
}

export const getIntersectedShapeId = (pointX: number, pointY: number, shapes: IShape[] ) => {
    let shapeId = '';
    for (let i = shapes.length - 1; i >= 0; i--) {
        if (isPointInShape(pointX, pointY, shapes[i])) {
            shapeId = shapes[i].id;
            break;
        }
    }
    return shapeId;
}

export const getIntersectedConnectionId = (pointX: number, pointY: number, connections: IConnection[] ) => {
    let connectionId = '';
    for (let i = connections.length - 1; i >= 0; i--) {
        if (isPointInLine(pointX, pointY, connections[i].id)) {
            connectionId = connections[i].id;
            break;
        }
    }
    return connectionId;
}