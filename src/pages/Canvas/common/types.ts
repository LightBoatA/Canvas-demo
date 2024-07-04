import { EShape } from "../../Toolbar/common";

export enum EConnectPointDirection {
    "LEFT" = "LEFT",
    "TOP" = "TOP",
    "RIGHT" = "RIGHT",
    "BOTTOM" = "BOTTOM",
}

export enum EElement {
    "CONNECTION" = "CONNECTION",
    "SHAPE" = "SHAPE",
}

export enum EMouseMoveMode {
    "DEFAULT" = "DEFAULT", // 无操作
    "MOVE" = "MOVE", // 移动
    "RESIZE" = "RESIZE", // 缩放
    "ROTATE" = "ROTATE", // 旋转
    "CONNECT" = "CONNECT", // 画连接线
    "BOX_SELECTION" = "BOX_SELECTION" // 框选
}
export interface IPoint {
    x: number;
    y: number;
}

export interface IMouseMoveInfo {
    rectOffset: { distanceX: number, distanceY: number }; // 选框相对于光标位置的偏移
    offsetMap: Map<string, { distanceX: number, distanceY: number }>; // 图形相对于选框位置的偏移
}

export interface IConnectionPoint extends IPoint {
    direction: EConnectPointDirection;
}
export interface IShape {
    id: string;
    type: EShape;
    data: IShapeData;
    x: number; // 中心点
    y: number;
    width: number;
    height: number;
    text: string;
    connectionPoints: IConnectionPoint[]
}

export interface IRect {
    x: number; // 中心点
    y: number;
    width: number;
    height: number;
}

export interface IBounds {
    top: number;
    left: number;
    right: number;
    bottom: number;
}
export interface IShapeConnectionPoint {
    shape: IShape,
    point: IConnectionPoint
}

export interface IConnection {
    fromShape: IShape;
    toShape: IShape;
    fromPoint: IConnectionPoint;
    toPoint: IConnectionPoint;
    id: string;
}

export type IShapeData = IRectData | ICircleData | IParallelogramData;

export interface IRectData {

}

export interface ICircleData {

}

export interface IParallelogramData {
    tangentAlpha: number;
}

export enum EDirection {
    LEFT_TOP = 'LEFT_TOP',
    LEFT_BOTTOM = 'LEFT_BOTTOM',
    RIGHT_TOP = 'RIGHT_TOP',
    RIGHT_BOTTOM = 'RIGHT_BOTTOM',
}

export interface ICtrlPoint {
    x: number;
    y: number;
    direction: EDirection;
}

export interface IHelpLineData {
    hVals: number[];
    vVals: number[];
}