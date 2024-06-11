// export enum EShapeName = 
export enum EShape {
    'RECT' = 'RECT',
    'CIRCLE' = 'CIRCLE',
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
    }
]