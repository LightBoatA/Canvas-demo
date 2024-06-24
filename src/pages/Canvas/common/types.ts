import { EShape } from "../../Toolbar/common";

export enum EConnectPointDirection {
    "LEFT" = "LEFT",
    "TOP" = "TOP",
    "RIGHT" = "RIGHT",
    "BOTTOM" = "BOTTOM",
}
export interface IPoint {
    x: number;
    y: number;
}

export interface IMouseInfo {
    isDown: boolean;
    mouseOffset: IPoint;
}

export interface IConnectionPoint extends IPoint {
    direction: EConnectPointDirection;
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
    connectionPoints: IConnectionPoint[]
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

export interface ICtrlPoint {
    x: number;
    y: number;
    direction: EDirection;
}

export interface IHelpLineData {
    hVals: number[];
    vVals: number[];
}