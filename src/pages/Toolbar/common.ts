// export enum EShapeName = 
export enum EShape {
    'RECT' = 'RECT',
    'CIRCLE' = 'CIRCLE',
    'DIAMOND' = 'DIAMOND', // 菱形
    'ROUNDED_RECT' = 'ROUNDED_RECT', // 圆角矩形
}
export interface IDragShap {
    name: EShape;
    class: string;
}
export const DRAG_SHAPES: IDragShap[] = [
    {
        name: EShape.RECT,
        class: 'shape-rect',
    },
    {
        name: EShape.CIRCLE,
        class: 'shape-circle',
    },
    {
        name: EShape.DIAMOND,
        class: 'shape-diamond',
    },
    {
        name: EShape.ROUNDED_RECT,
        class: 'shape-round-rect',
    }
]