import { getCryptoUuid } from "../../../utils/util";
import { EShape } from "../../Toolbar/common";
import { COMMON_SHAPE_SIZE, INIT_SHAPES, STRING_CONNECTOR } from "./constant";
import { EConnectPointDirection, IConnectionPoint, IShape, IShapeData } from "./types";

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
        { x, y: y - height / 2, direction: EConnectPointDirection.TOP },
        { x: x + width / 2, y, direction: EConnectPointDirection.RIGHT },
        { x, y: y + height / 2, direction: EConnectPointDirection.BOTTOM },
        { x: x - width / 2, y, direction: EConnectPointDirection.LEFT },
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