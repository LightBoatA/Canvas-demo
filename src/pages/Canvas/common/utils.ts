import { getCryptoUuid } from "../../../utils/util";
import { EShape } from "../../Toolbar/common";
import { COMMON_SHAPE_SIZE, INIT_SHAPES } from "./constant";
import { IShape, IShapeData } from "./types";

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

    return {
        ...shapeData,
        id,
        x,
        y,
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