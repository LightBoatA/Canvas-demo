import { getCryptoUuid } from '../../../utils/util';
import { EShape } from '../../Toolbar/common';
import {
  calcMouseMoveInfo,
  calcMultipleSelectRect,
  getConnectionPointVal,
  getIntersectedConnectionPoint,
  getIntersectedControlPoint,
  isPointInLine,
  isPointInShape
} from './calculator';
import { COMMON_SHAPE_SIZE, INIT_SHAPES, STRING_CONNECTOR } from './constant';
import { EConnectPointDirection, EDirection, EElement, IBounds, IConnection, IConnectionPoint, IRect, IShape, IShapeData } from './types';

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
  const id = getCryptoUuid();
  const shapeData = INIT_SHAPES[name];
  const { width, height } = shapeData;
  const connectionPoints: IConnectionPoint[] = [
    getConnectionPointVal(x, y, width, height, EConnectPointDirection.TOP),
    getConnectionPointVal(x, y, width, height, EConnectPointDirection.RIGHT),
    getConnectionPointVal(x, y, width, height, EConnectPointDirection.BOTTOM),
    getConnectionPointVal(x, y, width, height, EConnectPointDirection.LEFT)
  ];
  return {
    ...shapeData,
    id,
    x,
    y,
    connectionPoints
  };
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
export const getMouseMoveInfo = (
  selectedMap: Map<string, EElement>,
  connections: IConnection[],
  selectedShapes: IShape[],
  offsetX: number,
  offsetY: number
) => {
  const newSelectRect = calcMultipleSelectRect(selectedMap, connections, selectedShapes);
  const newMouseMoveInfo = calcMouseMoveInfo(newSelectRect, selectedShapes, offsetX, offsetY);
  return newMouseMoveInfo;
};

/**
 * 获取与光标相交的各种元素信息
 * @param shapes
 * @param connections
 * @param multipleSelectRect
 * @param offsetX
 * @param offsetY
 * @returns
 */
export const getIntersectedInfo = (
  shapes: IShape[],
  connections: IConnection[],
  multipleSelectRect: IRect | null,
  offsetX: number,
  offsetY: number
) => {
  // 与光标相交的连接点
  const intersectedConnectionPoint = getIntersectedConnectionPoint(shapes, offsetX, offsetY);
  // 与光标相交的形状
  const intersectedShape = getIntersectedShape(shapes, offsetX, offsetY); // TODO: 这里一定要先计算出来吗？
  // 与光标相交的连接线
  const intersectConnectionId = getIntersectedConnectionId(offsetX, offsetY, connections);
  // 与光标相交的缩放控制点
  const intersectedResizeCtrlPoint = getIntersectedControlPoint(offsetX, offsetY, multipleSelectRect);

  return {
    intersectedConnectionPoint,
    intersectedShape,
    intersectConnectionId,
    intersectedResizeCtrlPoint
  };
};
