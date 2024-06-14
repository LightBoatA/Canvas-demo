import { EShape } from "../../Toolbar/common";

export interface IPoint {
    x: number;
    y: number;
}

export interface IMouseInfo {
    isDown: boolean;
    mouseOffset: IPoint;
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