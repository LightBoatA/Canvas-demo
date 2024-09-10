import { EShape } from '../../Toolbar/common';
import { Circle } from '../shapes/Circle';
import { Diamond } from '../shapes/Diamond';
import { Parallelogram } from '../shapes/Parallelogram';
import { Rectangle } from '../shapes/Rectangle';
import { RoundedRect } from '../shapes/RoundedRect';
import { Shape } from '../shapes/Shape';
import { shapeFactoryMap } from '../shapes/ShapeFactoryMap';
import { calcMouseMoveInfo, calcMultipleSelectRect, isPointInLine, isPointInShape } from './calculator';
import { EElement, IBounds, IConnection, IRect, ISelectedMapObj, IShape } from './types';

/**
 * 获取形状的边界坐标值
 * @param rect
 * @returns
 */
export const getRectBounds = (rect: IRect): IBounds => {
  const { x, y, width, height } = rect;
  return {
    top: y - height / 2,
    right: x + width / 2,
    bottom: y + height / 2,
    left: x - width / 2
  };
};

/**
 * 根据不同形状种类，生成初始图形数据
 * @param name 形状种类名称
 * @param x 初始放置的x坐标
 * @param y
 * @returns
 */
export const getInitShapeData = (name: EShape, x: number, y: number): IShape => {
  const factory = shapeFactoryMap[name];
  if (!factory) {
    throw new Error(`No factory found for shape type ${name}`);
  }

  return factory.createShapeData(x, y);
};

/**
 * 根据id找到对应shape
 * @param shapes
 * @param id
 * @returns
 */
export const getShapeById = (shapes: IShape[], id: string) => {
  const resShape = shapes.find(shape => shape.id === id);
  return resShape;
};

/**
 * 获取与光标相交的形状
 * @param shapes
 * @param pointX
 * @param pointY
 * @returns
 */
export const getIntersectedShape = (shapes: IShape[], pointX: number, pointY: number) => {
  let shape = null;
  for (let i = shapes.length - 1; i >= 0; i--) {
    if (isPointInShape(pointX, pointY, shapes[i])) {
      shape = shapes[i];
      break;
    }
  }
  return shape;
};

/**
 * 获取与光标相交的连接线id
 * @param pointX
 * @param pointY
 * @param connections
 * @returns
 */
export const getIntersectedConnectionId = (pointX: number, pointY: number, connections: IConnection[]) => {
  let connectionId = '';
  for (let i = connections.length - 1; i >= 0; i--) {
    if (isPointInLine(pointX, pointY, connections[i].id)) {
      connectionId = connections[i].id;
      break;
    }
  }
  return connectionId;
};

/**
 * 获取鼠标移动时，多选框、被选形状之间的偏移量数据
 * @param selectedMap
 * @param connections
 * @param selectedShapes
 * @param offsetX
 * @param offsetY
 * @returns
 */
export const getMouseMoveInfo = (selectedMap: Map<string, EElement>, connections: IConnection[], selectedShapes: IShape[], offsetX: number, offsetY: number) => {
  const newSelectRect = calcMultipleSelectRect(selectedMap, connections, selectedShapes);
  const newMouseMoveInfo = calcMouseMoveInfo(newSelectRect, selectedShapes, offsetX, offsetY);
  return newMouseMoveInfo;
};

/**
 * 获取选择的形状
 * @param selectedMap
 * @param shapes
 * @returns
 */
export const getSelectedShapes = (selectedMap: ISelectedMapObj, shapes: IShape[]) => {
  if (Object.keys(selectedMap).length <= 0) return [];
  return shapes.filter(shape => selectedMap[shape.id]);
};

export const createShpaeInstance = (shapeData: IShape): Shape => {
  switch (shapeData.type) {
    case EShape.RECT:
      return new Rectangle({ ...shapeData });
    case EShape.CIRCLE:
      return new Circle({ ...shapeData });
    case EShape.DIAMOND:
      return new Diamond({ ...shapeData });
    case EShape.ROUNDED_RECT:
      return new RoundedRect({ ...shapeData });
    case EShape.PARALLELOGRAM:
      return new Parallelogram({ ...shapeData }, shapeData.tangentAlpha || 1);
    default:
      throw new Error('Unknown shape type');
  }
};
